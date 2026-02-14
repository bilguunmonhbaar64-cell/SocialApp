import { BASE_URL, getValidToken, type ApiResponse } from "./config";
import * as FileSystem from "expo-file-system/legacy";

export type ReelVisibility = "public" | "followers" | "private";
export type ReelStatus = "uploading" | "processing" | "ready" | "failed";
export type ReelTab = "reels" | "friends";

export interface ReelAuthor {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Reel {
  id: string;
  author: ReelAuthor;
  caption: string;
  music: string;
  storageKey: string;
  originalUrl: string;
  playbackUrl: string;
  thumbUrl: string;
  duration: number;
  width: number;
  height: number;
  visibility: ReelVisibility;
  status: ReelStatus;
  failureReason: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  repostsCount: number;
  sharesCount: number;
  savesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  ownedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}

export interface ReelUploadInitPayload {
  caption?: string;
  music?: string;
  visibility?: ReelVisibility;
  fileName?: string;
  mimeType?: string;
}

export interface ReelUploadInitResponse {
  reel: Reel;
  upload: {
    storageKey: string;
    method: "PUT";
    uploadUrl: string;
    headers: Record<string, string>;
    note: string;
  };
}

export interface ReelReadyPayload {
  playbackUrl: string;
  thumbUrl?: string;
  music?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface ReelLocalUploadPayload {
  fileUri: string;
  mimeType?: string;
  fileName?: string;
}

const getAuthHeaders = async (withJson = false) => {
  const token = await getValidToken();
  if (!token) {
    return { error: "Session expired. Please sign in again." as const };
  }

  return {
    headers: {
      ...(withJson ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    },
  };
};

export async function fetchReels(tab: ReelTab = "reels"): Promise<ApiResponse<Reel[]>> {
  try {
    const auth = await getAuthHeaders();
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels?tab=${tab}`, {
      headers: auth.headers,
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to fetch reels" };
    }
    return { data: json.reels };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function fetchMyReels(): Promise<ApiResponse<Reel[]>> {
  try {
    const auth = await getAuthHeaders();
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/mine`, {
      headers: auth.headers,
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to fetch your reels" };
    }
    return { data: json.reels };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function seedReels(): Promise<ApiResponse<{ count: number; message: string }>> {
  try {
    const auth = await getAuthHeaders();
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/seed`, {
      method: "POST",
      headers: auth.headers,
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to seed reels" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function initiateReelUpload(
  payload: ReelUploadInitPayload,
): Promise<ApiResponse<ReelUploadInitResponse>> {
  try {
    const auth = await getAuthHeaders(true);
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/uploads/initiate`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(payload),
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to start reel upload" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function completeReelUpload(
  reelId: string,
  payload: { storageKey?: string; originalUrl?: string },
): Promise<ApiResponse<Reel>> {
  try {
    const auth = await getAuthHeaders(true);
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/${reelId}/uploads/complete`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(payload),
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to complete upload" };
    }
    return { data: json.reel };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function uploadReelVideoLocal(
  reelId: string,
  payload: ReelLocalUploadPayload,
): Promise<ApiResponse<{ storageKey: string; videoUrl: string }>> {
  try {
    const auth = await getAuthHeaders(true);
    if ("error" in auth) return { error: auth.error };

    const base64Data = await FileSystem.readAsStringAsync(payload.fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch(`${BASE_URL}/api/reels/${reelId}/uploads/local`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({
        base64Data,
        mimeType: payload.mimeType || "video/mp4",
        fileName: payload.fileName || "original.mp4",
      }),
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to upload video file" };
    }

    return {
      data: {
        storageKey: json.storageKey,
        videoUrl: json.videoUrl,
      },
    };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function markReelReady(
  reelId: string,
  payload: ReelReadyPayload,
): Promise<ApiResponse<Reel>> {
  try {
    const auth = await getAuthHeaders(true);
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/${reelId}/ready`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(payload),
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to mark reel ready" };
    }
    return { data: json.reel };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function markReelFailed(
  reelId: string,
  failureReason: string,
): Promise<ApiResponse<Reel>> {
  try {
    const auth = await getAuthHeaders(true);
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/${reelId}/failed`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({ failureReason }),
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to mark reel failed" };
    }
    return { data: json.reel };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function updateReel(
  reelId: string,
  updates: {
    caption?: string;
    music?: string;
    visibility?: ReelVisibility;
    thumbUrl?: string;
  },
): Promise<ApiResponse<Reel>> {
  try {
    const auth = await getAuthHeaders(true);
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/${reelId}`, {
      method: "PATCH",
      headers: auth.headers,
      body: JSON.stringify(updates),
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to update reel" };
    }
    return { data: json.reel };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function deleteReel(
  reelId: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const auth = await getAuthHeaders();
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/${reelId}`, {
      method: "DELETE",
      headers: auth.headers,
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to delete reel" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function toggleReelLike(
  reelId: string,
): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
  try {
    const auth = await getAuthHeaders();
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/${reelId}/like`, {
      method: "POST",
      headers: auth.headers,
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to toggle reel like" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function toggleReelSave(
  reelId: string,
): Promise<ApiResponse<{ saved: boolean; savesCount: number }>> {
  try {
    const auth = await getAuthHeaders();
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/${reelId}/save`, {
      method: "POST",
      headers: auth.headers,
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to toggle reel save" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function viewReel(
  reelId: string,
): Promise<ApiResponse<{ viewed: boolean; viewsCount: number }>> {
  try {
    const auth = await getAuthHeaders();
    if ("error" in auth) return { error: auth.error };

    const response = await fetch(`${BASE_URL}/api/reels/${reelId}/view`, {
      method: "POST",
      headers: auth.headers,
    });
    const json = await response.json();

    if (!response.ok) {
      return { error: json.message || "Failed to track reel view" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}
