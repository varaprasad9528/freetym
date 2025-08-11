const jwt = require('jsonwebtoken');

module.exports = function guestSearchLimit(req, res, next) {
  // If user is authenticated (JWT in header), skip limit
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
      return next();
    } catch (e) {
      // Invalid token, treat as guest
    }
  }

  // Use a cookie to track guest search count
  let count = 0;
  if (req.cookies && req.cookies.guestSearchCount) {
    count = parseInt(req.cookies.guestSearchCount, 10) || 0;
  }
  if (count >= 5) {
    return res.status(429).json({ error: 'Please login to continue searching influencers.' });
  }
  // Increment and set cookie
  res.cookie('guestSearchCount', count + 1, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  next();
} 