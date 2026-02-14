import { BASE_URL, getValidToken, type ApiResponse } from "./config";
import type { PublicUserProfile, SearchUserResult } from "./users";

// ─── Types ──────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface ConversationItem {
  user: SearchUserResult;
  lastMessage: {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
}

// ─── Messaging ──────────────────────────────────────────────────────────
export async function getConversations(): Promise<
  ApiResponse<ConversationItem[]>
> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(`${BASE_URL}/api/messages/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to load conversations" };
    }
    return { data: json.conversations };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function getMessages(
  userId: string,
): Promise<
  ApiResponse<{ messages: ChatMessage[]; otherUser: PublicUserProfile }>
> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(`${BASE_URL}/api/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to load messages" };
    }
    return { data: json };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}

export async function sendMessage(
  userId: string,
  text: string,
): Promise<ApiResponse<ChatMessage>> {
  try {
    const token = await getValidToken();
    if (!token) return { error: "Session expired. Please sign in again." };

    const response = await fetch(`${BASE_URL}/api/messages/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    const json = await response.json();
    if (!response.ok) {
      return { error: json.message || "Failed to send message" };
    }
    return { data: json.message };
  } catch (err: any) {
    return { error: err.message || "Network error" };
  }
}
