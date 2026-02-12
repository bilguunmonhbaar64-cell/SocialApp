const express = require("express");
const { body, param } = require("express-validator");
const {
  addComment,
  createPost,
  deletePost,
  listPosts,
  toggleLike,
} = require("../controllers/postController");
const { requireAuth } = require("../middlewares/auth");
const { validateRequest } = require("../utils/validateRequest");

const router = express.Router();

router.get("/", listPosts);

router.post(
  "/",
  requireAuth,
  [
    body("text")
      .trim()
      .isLength({ min: 1, max: 2200 })
      .withMessage("Post text must be 1-2200 chars"),
    body("imageUrl").optional({ values: "falsy" }).isURL().withMessage("imageUrl must be a URL"),
    validateRequest,
  ],
  createPost
);

router.post(
  "/:postId/like",
  requireAuth,
  [param("postId").isMongoId().withMessage("Invalid post id"), validateRequest],
  toggleLike
);

router.post(
  "/:postId/comments",
  requireAuth,
  [
    param("postId").isMongoId().withMessage("Invalid post id"),
    body("text")
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Comment must be 1-500 chars"),
    validateRequest,
  ],
  addComment
);

router.delete(
  "/:postId",
  requireAuth,
  [param("postId").isMongoId().withMessage("Invalid post id"), validateRequest],
  deletePost
);

module.exports = router;
