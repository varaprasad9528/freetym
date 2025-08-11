require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Import logger
const logger = require('./utils/logger');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// Config
const connectDB = require('./config/db');
connectDB();

// Initialize analytics service
const analyticsService = require('./services/analyticsService');
analyticsService.init();

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);    //done  //postman

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const planRoutes = require('./routes/plan');
app.use('/api/plans', planRoutes);    // for admin 

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);   // done  // postman

const subscriptionRoutes = require('./routes/subscription');
app.use('/api/subscription', subscriptionRoutes);   // done ? post man ?

const campaignRoutes = require('./routes/campaign');
app.use('/api/campaigns', campaignRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);


const influencerRoutes = require('./routes/influencer');
app.use('/api/influencer', influencerRoutes);   // influncer 

const applicationRoutes = require('./routes/application');
app.use('/api/applications', applicationRoutes);

const otpRoutes = require('./routes/otp');
app.use('/api/otp', otpRoutes);  


const socialRoutes = require('./routes/social');
app.use('/api/social', socialRoutes);

//Public routes (landing page features)
const publicRoutes = require('./routes/public');
app.use('/api/public', publicRoutes);   //done   // postman

// Wallet routes (KYC and balance)
const walletRoutes = require('./routes/wallet');
app.use('/api/wallet', walletRoutes);    // done  // postman

//  Reels routes (inspiration feature)
const reelsRoutes = require('./routes/reels');
app.use('/api/reels', reelsRoutes);  // done   // postman done 

//  Health monitoring routes
const healthRoutes = require('./routes/health');
app.use('/api/health', healthRoutes);

// Import error handling middleware
const { errorHandler } = require('./middleware/errorHandler');

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Freetym backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  // logger.info(`🚀 Server running on port ${PORT}`);
  // logger.info(`📊 Analytics service initialized`);
  // logger.info(`🔍 Health monitoring available at /api/health`);
});

// fetching instagram reels at 2 am 
require('./services/fetchInstagramReels');
// fetching youtube reels at 2 am 
require('./services//fetchYoutubeReels');