const rateLimit = require('express-rate-limit');

// Rate limiting for public search: 5 searches per hour per IP
const publicSearchLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Rate limit exceeded. Please try again in an hour or login for unlimited searches.',
    limit: 5,
    windowMs: 60 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP address for rate limiting
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded. Please try again in an hour or login for unlimited searches.',
      limit: 5,
      windowMs: 60 * 60 * 1000
    });
  }
});

module.exports = publicSearchLimit; 