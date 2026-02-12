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

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const user = req.user;

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();
    return res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      throw createHttpError(400, "Current password is incorrect");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.status(200).json({ message: "Password updated" });
  } catch (error) {
    return next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const Post = require("../models/Post");
    // Remove user's posts
    await Post.deleteMany({ author: req.user._id });
    // Remove the user
    await User.deleteOne({ _id: req.user._id });
    return res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
};
