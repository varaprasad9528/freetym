const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../Server');
const User = require('../../models/User');
const Otp = require('../../models/Otp');
const bcrypt = require('bcryptjs');

describe('Authentication Unit Tests', () => {
  let testUser;
  let testOtp;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/freetym_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Otp.deleteMany({});
    
    // Create test user
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

  describe('POST /api/auth/register/email', () => {
    it('should send email OTP successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register/email')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          role: 'influencer'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('OTP sent to email.');
      
      // Check if OTP was created
      const otp = await Otp.findOne({ email: 'newuser@example.com', type: 'email' });
      expect(otp).toBeTruthy();
      expect(otp.otp).toHaveLength(6);
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register/email')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          role: 'influencer'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already registered.');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register/email')
        .send({
          name: 'Test User'
          // Missing email and role
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name, email, and role are required.');
    });
  });

  describe('POST /api/auth/register/email/verify', () => {
    beforeEach(async () => {
      // Create test OTP
      testOtp = await Otp.create({
        email: 'test@example.com',
        otp: '123456',
        type: 'email',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
    });

    it('should verify email OTP successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register/email/verify')
        .send({
          email: 'test@example.com',
          otp: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email OTP verified.');
      
      // Check if OTP was marked as verified
      const otp = await Otp.findById(testOtp._id);
      expect(otp.verified).toBe(true);
    });

    it('should reject invalid OTP', async () => {
      const response = await request(app)
        .post('/api/auth/register/email/verify')
        .send({
          email: 'test@example.com',
          otp: '999999'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired OTP.');
    });

    it('should reject expired OTP', async () => {
      // Create expired OTP
      await Otp.create({
        email: 'expired@example.com',
        otp: '123456',
        type: 'email',
        expiresAt: new Date(Date.now() - 10 * 60 * 1000) // Expired 10 minutes ago
      });

      const response = await request(app)
        .post('/api/auth/register/email/verify')
        .send({
          email: 'expired@example.com',
          otp: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired OTP.');
    });
  });

  describe('POST /api/auth/register/phone', () => {
    beforeEach(async () => {
      // Create verified email OTP
      await Otp.create({
        email: 'test@example.com',
        otp: '123456',
        type: 'email',
        verified: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
    });

    it('should send WhatsApp OTP successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register/phone')
        .send({
          phone: '+1234567890',
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('OTP sent to WhatsApp.');
      
      // Check if OTP was created
      const otp = await Otp.findOne({ phone: '+1234567890', type: 'whatsapp' });
      expect(otp).toBeTruthy();
      expect(otp.otp).toHaveLength(6);
    });

    it('should require verified email OTP', async () => {
      const response = await request(app)
        .post('/api/auth/register/phone')
        .send({
          phone: '+1234567890',
          email: 'unverified@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email OTP not verified.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.role).toBe('influencer');
      expect(response.body.userId).toBe(testUser._id.toString());
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials.');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials.');
    });

    it('should reject pending influencer', async () => {
      // Create pending influencer
      const pendingUser = await User.create({
        name: 'Pending User',
        email: 'pending@example.com',
        phone: '+1234567891',
        password: await bcrypt.hash('TestPassword123', 10),
        role: 'influencer',
        status: 'pending'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'pending@example.com',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Account pending approval.');
    });
  });

  describe('Password Hashing', () => {
    it('should hash passwords correctly', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toHaveLength(60); // bcrypt hash length
      
      const isMatch = await bcrypt.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
    });
  });

  describe('JWT Token', () => {
    it('should generate valid JWT token', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: testUser._id, role: testUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      expect(token).toBeTruthy();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(testUser._id.toString());
      expect(decoded.role).toBe(testUser.role);
    });
  });
}); 