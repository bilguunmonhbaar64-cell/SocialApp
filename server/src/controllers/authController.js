const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { createHttpError } = require("../utils/httpError");
const { generateToken } = require("../utils/generateToken");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw createHttpError(409, "Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = generateToken(user._id.toString());

    return res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw createHttpError(401, "Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw createHttpError(401, "Invalid email or password");
    }

    const token = generateToken(user._id.toString());
    return res.status(200).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user.toJSON() });
};

module.exports = {
  register,
  login,
  getMe,
};
