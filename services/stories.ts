import { BASE_URL, getValidToken, type ApiResponse } from "./config";

// ─── Types ──────────────────────────────────────────────────────────────
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

// ─── Stories ────────────────────────────────────────────────────────────
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
