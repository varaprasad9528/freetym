const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../Server');
const User = require('../../models/User');
const Otp = require('../../models/Otp');
const Campaign = require('../../models/Campaign');
const Application = require('../../models/Application');

describe('User Flow Integration Tests', () => {
  let authToken;
  let testUser;
  let testCampaign;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/freetym_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Otp.deleteMany({});
    await Campaign.deleteMany({});
    await Application.deleteMany({});
  });

  describe('Complete Registration Flow', () => {
    it('should complete full registration process for influencer', async () => {
      // Step 1: Send email OTP
      const emailResponse = await request(app)
        .post('/api/auth/register/email')
        .send({
          name: 'Test Influencer',
          email: 'influencer@test.com',
          role: 'influencer'
        });

      expect(emailResponse.status).toBe(200);
      expect(emailResponse.body.message).toBe('OTP sent to email.');

      // Get OTP from database (in real scenario, this would be sent via email)
      const emailOtp = await Otp.findOne({ email: 'influencer@test.com', type: 'email' });
      expect(emailOtp).toBeTruthy();

      // Step 2: Verify email OTP
      const emailVerifyResponse = await request(app)
        .post('/api/auth/register/email/verify')
        .send({
          email: 'influencer@test.com',
          otp: emailOtp.otp
        });

      expect(emailVerifyResponse.status).toBe(200);
      expect(emailVerifyResponse.body.message).toBe('Email OTP verified.');

      // Step 3: Send WhatsApp OTP
      const phoneResponse = await request(app)
        .post('/api/auth/register/phone')
        .send({
          phone: '+1234567890',
          email: 'influencer@test.com'
        });

      expect(phoneResponse.status).toBe(200);
      expect(phoneResponse.body.message).toBe('OTP sent to WhatsApp.');

      // Get WhatsApp OTP from database
      const phoneOtp = await Otp.findOne({ phone: '+1234567890', type: 'whatsapp' });
      expect(phoneOtp).toBeTruthy();

      // Step 4: Verify WhatsApp OTP
      const phoneVerifyResponse = await request(app)
        .post('/api/auth/register/phone/verify')
        .send({
          phone: '+1234567890',
          otp: phoneOtp.otp
        });

      expect(phoneVerifyResponse.status).toBe(200);
      expect(phoneVerifyResponse.body.message).toBe('WhatsApp OTP verified.');

      // Step 5: Complete registration
      const completeResponse = await request(app)
        .post('/api/auth/register/details')
        .send({
          name: 'Test Influencer',
          email: 'influencer@test.com',
          phone: '+1234567890',
          password: 'TestPassword123',
          role: 'influencer',
          country: 'US',
          language: 'en',
          instagram: 'https://instagram.com/testinfluencer',
          youtube: 'https://youtube.com/testinfluencer',
          followers: 10000,
          subscribers: 5000
        });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.message).toBe('Registration successful. Please login.');

      // Verify user was created with correct status
      const user = await User.findOne({ email: 'influencer@test.com' });
      expect(user).toBeTruthy();
      expect(user.status).toBe('pending'); // Influencers need admin approval
      expect(user.role).toBe('influencer');
    });

    it('should complete full registration process for brand', async () => {
      // Step 1: Send email OTP
      await request(app)
        .post('/api/auth/register/email')
        .send({
          name: 'Test Brand',
          email: 'brand@test.com',
          role: 'brand'
        });

      const emailOtp = await Otp.findOne({ email: 'brand@test.com', type: 'email' });

      // Step 2: Verify email OTP
      await request(app)
        .post('/api/auth/register/email/verify')
        .send({
          email: 'brand@test.com',
          otp: emailOtp.otp
        });

      // Step 3: Send WhatsApp OTP
      await request(app)
        .post('/api/auth/register/phone')
        .send({
          phone: '+1234567891',
          email: 'brand@test.com'
        });

      const phoneOtp = await Otp.findOne({ phone: '+1234567891', type: 'whatsapp' });

      // Step 4: Verify WhatsApp OTP
      await request(app)
        .post('/api/auth/register/phone/verify')
        .send({
          phone: '+1234567891',
          otp: phoneOtp.otp
        });

      // Step 5: Complete registration
      const completeResponse = await request(app)
        .post('/api/auth/register/details')
        .send({
          name: 'Test Brand',
          email: 'brand@test.com',
          phone: '+1234567891',
          password: 'TestPassword123',
          role: 'brand',
          country: 'US',
          language: 'en'
        });

      expect(completeResponse.status).toBe(200);

      // Verify user was created with approved status
      const user = await User.findOne({ email: 'brand@test.com' });
      expect(user).toBeTruthy();
      expect(user.status).toBe('approved'); // Brands are auto-approved
      expect(user.role).toBe('brand');
    });
  });

  describe('Login and Authentication Flow', () => {
    beforeEach(async () => {
      // Create approved test user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('TestPassword123', 10);
      
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: hashedPassword,
        role: 'influencer',
        status: 'approved'
      });
    });

    it('should login and access protected routes', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      
      authToken = loginResponse.body.token;

      // Access protected route
      const profileResponse = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.email).toBe('test@example.com');
    });

    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/user/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided.');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/user/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token.');
    });
  });

  describe('Campaign Management Flow', () => {
    beforeEach(async () => {
      // Create brand user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('TestPassword123', 10);
      
      const brandUser = await User.create({
        name: 'Test Brand',
        email: 'brand@test.com',
        phone: '+1234567890',
        password: hashedPassword,
        role: 'brand',
        status: 'approved'
      });

      // Login as brand
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'brand@test.com',
          password: 'TestPassword123'
        });

      authToken = loginResponse.body.token;

      // Create test campaign
      testCampaign = await Campaign.create({
        brand: brandUser._id,
        title: 'Test Campaign',
        description: 'This is a test campaign',
        category: 'lifestyle',
        budget: 1000,
        status: 'active'
      });
    });

    it('should allow brand to create campaign', async () => {
      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Test Campaign',
          description: 'This is a new test campaign',
          category: 'fashion',
          budget: 2000,
          targetAudience: 'Young adults',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Test Campaign');
    });

    it('should allow brand to view their campaigns', async () => {
      const response = await request(app)
        .get('/api/campaigns/my')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should allow brand to update campaign', async () => {
      const response = await request(app)
        .put(`/api/campaigns/${testCampaign._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Campaign',
          description: 'This is an updated test campaign'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Test Campaign');
    });
  });

  describe('Influencer Application Flow', () => {
    beforeEach(async () => {
      // Create brand and campaign
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('TestPassword123', 10);
      
      const brandUser = await User.create({
        name: 'Test Brand',
        email: 'brand@test.com',
        phone: '+1234567890',
        password: hashedPassword,
        role: 'brand',
        status: 'approved'
      });

      testCampaign = await Campaign.create({
        brand: brandUser._id,
        title: 'Test Campaign',
        description: 'This is a test campaign',
        category: 'lifestyle',
        budget: 1000,
        status: 'active'
      });

      // Create influencer user
      const influencerUser = await User.create({
        name: 'Test Influencer',
        email: 'influencer@test.com',
        phone: '+1234567891',
        password: hashedPassword,
        role: 'influencer',
        status: 'approved'
      });

      // Login as influencer
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'influencer@test.com',
          password: 'TestPassword123'
        });

      authToken = loginResponse.body.token;
    });

    it('should allow influencer to view active campaigns', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow influencer to apply to campaign', async () => {
      const response = await request(app)
        .post(`/api/campaigns/${testCampaign._id}/apply`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          proposal: 'I would love to work on this campaign',
          expectedReach: 50000,
          price: 500
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Application submitted successfully.');

      // Verify application was created
      const application = await Application.findOne({
        campaign: testCampaign._id,
        influencer: response.body.influencer
      });
      expect(application).toBeTruthy();
      expect(application.status).toBe('pending');
    });

    it('should allow influencer to view their applications', async () => {
      // First apply to campaign
      await request(app)
        .post(`/api/campaigns/${testCampaign._id}/apply`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          proposal: 'Test proposal',
          expectedReach: 50000,
          price: 500
        });

      // Then view applications
      const response = await request(app)
        .get('/api/campaigns/applications/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Public Search Flow', () => {
    beforeEach(async () => {
      // Create test influencers
      await User.create([
        {
          name: 'Fashion Influencer',
          email: 'fashion@test.com',
          phone: '+1234567890',
          password: 'hashedpassword',
          role: 'influencer',
          status: 'approved',
          category: 'fashion',
          platform: 'instagram',
          followers: 50000
        },
        {
          name: 'Lifestyle Influencer',
          email: 'lifestyle@test.com',
          phone: '+1234567891',
          password: 'hashedpassword',
          role: 'influencer',
          status: 'approved',
          category: 'lifestyle',
          platform: 'youtube',
          subscribers: 30000
        }
      ]);
    });

    it('should allow public search without authentication', async () => {
      const response = await request(app)
        .get('/api/public/search')
        .query({
          query: 'fashion',
          category: 'fashion',
          platform: 'instagram'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.influencers)).toBe(true);
    });

    it('should respect rate limiting', async () => {
      // Make multiple requests to trigger rate limiting
      const requests = Array(6).fill().map(() => 
        request(app)
          .get('/api/public/search')
          .query({ query: 'test' })
      );

      const responses = await Promise.all(requests);
      
      // First 5 should succeed, 6th should be rate limited
      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      expect(responses[2].status).toBe(200);
      expect(responses[3].status).toBe(200);
      expect(responses[4].status).toBe(200);
      expect(responses[5].status).toBe(429); // Rate limited
    });
  });

  describe('Demo Request Flow', () => {
    it('should allow public demo request submission', async () => {
      const response = await request(app)
        .post('/api/public/demo-requests')
        .send({
          name: 'Test Company',
          email: 'company@test.com',
          phone: '+1234567890',
          company: 'Test Corp',
          role: 'brand',
          message: 'We are interested in learning more about your platform'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Demo request submitted successfully');
    });

    it('should validate demo request fields', async () => {
      const response = await request(app)
        .post('/api/public/demo-requests')
        .send({
          name: 'Test Company'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
}); 