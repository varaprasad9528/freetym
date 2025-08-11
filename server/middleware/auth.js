const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log(req.headers)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role.' });
      }
      // console.log(decoded.userId,decoded.role)
      req.user = { userId: decoded.userId, role: decoded.role };
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
  };
}

module.exports = auth; 