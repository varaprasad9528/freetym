const jwt = require('jsonwebtoken');
const { decode } = require('punycode');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(req.headers)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Received Token:', token); 
    try {
      console.log("1")
      console.log('JWT Secret:', process.env.JWT_SECRET);  // Log the secret to check if it's set correctly
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded)
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role.' });
      }
      console.log(decoded.userId,decoded.role)
      req.user = { userId: decoded.userId, role: decoded.role };
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
  };
}

module.exports = auth; 