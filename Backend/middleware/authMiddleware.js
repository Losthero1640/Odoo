const jwt = require("jsonwebtoken");
const JWT_SECRET = "PhoenixCOde1234@"


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
  next();
}


module.exports = {authenticateToken, isAdmin};


