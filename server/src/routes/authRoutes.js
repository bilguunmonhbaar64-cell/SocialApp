const express = require("express");
const { body } = require("express-validator");
const {
  getMe,
  login,
  register,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");
const { requireAuth } = require("../middlewares/auth");
const { validateRequest } = require("../utils/validateRequest");

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 60 })
      .withMessage("Name must be 2-60 chars"),
    body("email").trim().isEmail().withMessage("Provide a valid email"),
    body("password")
      .isString()
      .isLength({ min: 8, max: 64 })
      .withMessage("Password must be 8-64 chars"),
    validateRequest,
  ],
  register,
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Provide a valid email"),
    body("password").isString().notEmpty().withMessage("Password is required"),
    validateRequest,
  ],
  login,
);

router.get("/me", requireAuth, getMe);

router.put(
  "/me",
  requireAuth,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 60 })
      .withMessage("Name must be 2-60 chars"),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 160 })
      .withMessage("Bio max 160 chars"),
    body("avatarUrl")
      .optional({ values: "falsy" })
      .isString()
      .withMessage("avatarUrl must be a string"),
    validateRequest,
  ],
  updateProfile,
);

router.put(
  "/me/password",
  requireAuth,
  [
    body("currentPassword")
      .isString()
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isString()
      .isLength({ min: 8, max: 64 })
      .withMessage("New password must be 8-64 chars"),
    validateRequest,
  ],
  changePassword,
);

router.delete("/me", requireAuth, deleteAccount);

module.exports = router;
