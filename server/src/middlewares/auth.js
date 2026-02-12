const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing bearer token" });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = {
  requireAuth,
};
