import { BASE_URL, getValidToken, type ApiResponse, type Post } from "./config";

// ─── Types ──────────────────────────────────────────────────────────────
export interface SearchUserResult {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
}

export interface UserProfileResponse {
  user: PublicUserProfile;
  posts: Post[];
  postCount: number;
  isFollowing: boolean;
}

// ─── Search Users ───────────────────────────────────────────────────────
export async function searchUsers(
  query: string,
): Promise<ApiResponse<SearchUserResult[]>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(
      `${BASE_URL}/api/auth/users/search?q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Search failed" };
    }
    return { data: json.users };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

// ─── Get User Public Profile ────────────────────────────────────────────
export async function getUserProfile(
  userId: string,
): Promise<ApiResponse<UserProfileResponse>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(`${BASE_URL}/api/auth/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to load profile" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

// ─── Follow System ──────────────────────────────────────────────────────
export async function toggleFollow(
  userId: string,
): Promise<ApiResponse<{ isFollowing: boolean; followersCount: number }>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(
      `${BASE_URL}/api/auth/users/${userId}/follow`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to follow/unfollow" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function getFollowersList(
  userId: string,
): Promise<ApiResponse<SearchUserResult[]>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(
      `${BASE_URL}/api/auth/users/${userId}/followers`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to load followers" };
    }
    return { data: json.users };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function getFollowingList(
  userId: string,
): Promise<ApiResponse<SearchUserResult[]>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(
      `${BASE_URL}/api/auth/users/${userId}/following`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to load following" };
    }
    return { data: json.users };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}
