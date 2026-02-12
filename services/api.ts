import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// ─── Pick the right server URL per platform ─────────────────────────────
const getBaseUrl = (): string => {
  if (Platform.OS === "web") {
    return "http://localhost:4000";
  }

  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    console.log("[API] Detected dev host:", host);
    return `http://${host}:4000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }
  return "http://localhost:4000";
};

const BASE_URL = getBaseUrl();
console.log(`[API] Platform: ${Platform.OS}, BASE_URL: ${BASE_URL}`);

// ─── Token helpers ──────────────────────────────────────────────────────
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const SESSION_EXPIRES_KEY = "auth_session_expires_at";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function saveAuth(token: string, user: any) {
  const sessionExpiresAt = Date.now() + SESSION_DURATION_MS;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  await AsyncStorage.setItem(SESSION_EXPIRES_KEY, String(sessionExpiresAt));
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUser(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, SESSION_EXPIRES_KEY]);
}

export async function getValidToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const expiresRaw = await AsyncStorage.getItem(SESSION_EXPIRES_KEY);

  if (!token || !expiresRaw) {
    await clearAuth();
    return null;
  }

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
    await clearAuth();
    return null;
  }

  return token;
}

// ─── Types ──────────────────────────────────────────────────────────────
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PostAuthor {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  author: PostAuthor;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  text: string;
  imageUrl: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ───────────────────────────────────────────────────────────────
export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const json = await response.json();

    if (!response.ok) {
      const errorMsg =
        json.message ||
        json.error ||
        (json.details ? JSON.stringify(json.details) : null) ||
        `Registration failed (HTTP ${response.status})`;
      return { error: errorMsg };
    }

    // Auto-save token
    await saveAuth(json.token, json.user);
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error – is the server running?" };
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();

    if (!response.ok) {
      const errorMsg =
        json.message || json.error || `Login failed (HTTP ${response.status})`;
      return { error: errorMsg };
    }

    // Auto-save token
    await saveAuth(json.token, json.user);
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error – is the server running?" };
  }
}

// ─── Posts ───────────────────────────────────────────────────────────────
export async function fetchPosts(): Promise<ApiResponse<Post[]>> {
  try {
    const response = await fetch(`${BASE_URL}/api/posts`);
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to fetch posts" };
    }

    return { data: json.posts };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function createPost(
  text: string,
  imageUrl?: string,
): Promise<ApiResponse<Post>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, imageUrl: imageUrl || "" }),
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to create post" };
    }
    return { data: json.post };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function toggleLike(
  postId: string,
): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to toggle like" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function addComment(
  postId: string,
  text: string,
): Promise<ApiResponse<Comment>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(`${BASE_URL}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to add comment" };
    }
    return { data: json.comment };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function deletePost(
  postId: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to delete post" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

// ─── Seed (dev only) ────────────────────────────────────────────────────
export async function seedPosts(): Promise<ApiResponse<{ count: number }>> {
  try {
    const response = await fetch(`${BASE_URL}/api/posts/seed`, {
      method: "POST",
    });
    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to seed" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

// ─── Profile ────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
}

export async function getMe(): Promise<ApiResponse<UserProfile>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to fetch profile" };
    }
    // Also update stored user
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(json.user));
    return { data: json.user };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function updateProfile(updates: {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<ApiResponse<UserProfile>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to update profile" };
    }
    // Update stored user
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(json.user));
    return { data: json.user };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`${BASE_URL}/api/auth/me/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to change password" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function deleteAccount(): Promise<
  ApiResponse<{ message: string }>
> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to delete account" };
    }
    await clearAuth();
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

// ─── Stories ────────────────────────────────────────────────────────────
export interface StoryItem {
  id: string;
  imageUrl: string;
  caption: string;
  viewers: string[];
  createdAt: string;
  expiresAt: string;
}

export interface StoryGroup {
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  stories: StoryItem[];
}

export async function fetchStories(): Promise<ApiResponse<StoryGroup[]>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`${BASE_URL}/api/stories`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to fetch stories" };
    }
    return { data: json.storyGroups };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function createStory(
  imageUrl: string,
  caption?: string,
): Promise<ApiResponse<StoryItem>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(`${BASE_URL}/api/stories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageUrl, caption: caption || "" }),
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to create story" };
    }
    return { data: json.story };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function viewStory(
  storyId: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`${BASE_URL}/api/stories/${storyId}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to view story" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function deleteStory(
  storyId: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Not authenticated" };

    const response = await fetch(`${BASE_URL}/api/stories/${storyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to delete story" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}
