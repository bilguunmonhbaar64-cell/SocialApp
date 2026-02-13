// ─── Barrel file ────────────────────────────────────────────────────────
// Re-exports everything so existing imports from "../../services/api" keep working.

// Config, token helpers & shared types
export {
  saveAuth,
  getToken,
  getUser,
  clearAuth,
  getValidToken,
  type ApiResponse,
  type PostAuthor,
  type Comment,
  type Post,
} from "./config";

// Auth & profile management
export {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  type UserProfile,
} from "./auth";

// Posts
export {
  fetchPosts,
  createPost,
  toggleLike,
  addComment,
  deletePost,
  seedPosts,
} from "./posts";

// Stories
export {
  fetchStories,
  createStory,
  viewStory,
  deleteStory,
  type StoryItem,
  type StoryGroup,
} from "./stories";

// Users, search & follow
export {
  searchUsers,
  getUserProfile,
  toggleFollow,
  getFollowersList,
  getFollowingList,
  type SearchUserResult,
  type PublicUserProfile,
  type UserProfileResponse,
} from "./users";

// Messaging
export {
  getConversations,
  getMessages,
  sendMessage,
  type ChatMessage,
  type ConversationItem,
} from "./messages";
