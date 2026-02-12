const express = require("express");
const { body } = require("express-validator");
const { getMe, login, register } = require("../controllers/authController");
const { requireAuth } = require("../middlewares/auth");
const { validateRequest } = require("../utils/validateRequest");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 chars"),
    body("email").trim().isEmail().withMessage("Provide a valid email"),
    body("password")
      .isString()
      .isLength({ min: 8, max: 64 })
      .withMessage("Password must be 8-64 chars"),
    validateRequest,
  ],
  register
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Provide a valid email"),
    body("password").isString().notEmpty().withMessage("Password is required"),
    validateRequest,
  ],
  login
);

router.get("/me", requireAuth, getMe);

module.exports = router;
