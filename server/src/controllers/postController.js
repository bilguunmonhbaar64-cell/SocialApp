const mongoose = require("mongoose");
const Post = require("../models/Post");
const { createHttpError } = require("../utils/httpError");

const listPosts = async (_req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("author", "name avatarUrl")
      .populate("comments.author", "name avatarUrl");

    return res.status(200).json({ posts });
  } catch (error) {
    return next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { text, imageUrl = "" } = req.body;
    const post = await Post.create({
      author: req.user._id,
      text,
      imageUrl,
      likes: [],
      comments: [],
    });

    await post.populate("author", "name avatarUrl");
    return res.status(201).json({ post });
  } catch (error) {
    return next(error);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id.toString();
    const post = await Post.findById(postId);

    if (!post) {
      throw createHttpError(404, "Post not found");
    }

    const currentIndex = post.likes.findIndex((id) => id.toString() === userId);
    const liked = currentIndex === -1;

    if (liked) {
      post.likes.push(new mongoose.Types.ObjectId(userId));
    } else {
      post.likes.splice(currentIndex, 1);
    }

    await post.save();
    return res.status(200).json({
      liked,
      likeCount: post.likes.length,
    });
  } catch (error) {
    return next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const post = await Post.findById(postId);

    if (!post) {
      throw createHttpError(404, "Post not found");
    }

    post.comments.push({
      author: req.user._id,
      text,
    });
    await post.save();
    await post.populate("comments.author", "name avatarUrl");

    const comment = post.comments[post.comments.length - 1];
    return res.status(201).json({ comment });
  } catch (error) {
    return next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      throw createHttpError(404, "Post not found");
    }

    if (post.author.toString() !== req.user._id.toString()) {
      throw createHttpError(403, "You can delete only your own posts");
    }

    await Post.deleteOne({ _id: postId });
    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listPosts,
  createPost,
  toggleLike,
  addComment,
  deletePost,
};
