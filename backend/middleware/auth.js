const jwt = require("jsonwebtoken");

// Ye middleware check karta hai ki request ke saath valid admin JWT token hai ya nahi
const protectAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized. Token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { id, email }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized. Invalid or expired token." });
  }
};

module.exports = { protectAdmin };
