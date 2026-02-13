import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getConversations,
  type ConversationItem,
} from "../../services/api";

export default function ConversationsModal({
  visible,
  currentUserId,
  onClose,
  onOpenChat,
}: {
  visible: boolean;
  currentUserId: string | null;
  onClose: () => void;
  onOpenChat: (userId: string, name: string, avatar: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    (async () => {
      const res = await getConversations();
      if (res.data) setConversations(res.data);
      setLoading(false);
    })();
  }, [visible]);

  // Poll every 5s
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(async () => {
      const res = await getConversations();
      if (res.data) setConversations(res.data);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 6,
            paddingHorizontal: 14,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
            backgroundColor: "#fff",
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#f3f4f6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 17,
              fontWeight: "700",
              color: "#111827",
              marginRight: 38,
            }}
          >
            Messages
          </Text>
        </View>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : conversations.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="chatbubbles-outline" size={56} color="#e5e7eb" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#9ca3af",
                marginTop: 12,
              }}
            >
              No conversations yet
            </Text>
            <Text style={{ fontSize: 13, color: "#d1d5db", marginTop: 4 }}>
              Start chatting with someone!
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.user.id}
            contentContainerStyle={{ paddingVertical: 4 }}
            renderItem={({ item }) => {
              const isMyMsg = item.lastMessage.senderId === currentUserId;
              return (
                <TouchableOpacity
                  onPress={() =>
                    onOpenChat(
                      item.user.id,
                      item.user.name,
                      item.user.avatarUrl || "",
                    )
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                  }}
                  activeOpacity={0.6}
                >
                  {/* Avatar */}
                  {item.user.avatarUrl ? (
                    <Image
                      source={{ uri: item.user.avatarUrl }}
                      style={{ width: 52, height: 52, borderRadius: 26 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: "#e0e7ff",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: "#4f46e5",
                        }}
                      >
                        {item.user.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  )}

                  {/* Text content */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: item.unreadCount > 0 ? "700" : "600",
                          color: "#111827",
                        }}
                      >
                        {item.user.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: item.unreadCount > 0 ? "#4f46e5" : "#9ca3af",
                        }}
                      >
                        {formatTime(item.lastMessage.createdAt)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 3,
                      }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: item.unreadCount > 0 ? "#374151" : "#9ca3af",
                          fontWeight: item.unreadCount > 0 ? "500" : "400",
                        }}
                        numberOfLines={1}
                      >
                        {isMyMsg ? "You: " : ""}
                        {item.lastMessage.text}
                      </Text>
                      {item.unreadCount > 0 && (
                        <View
                          style={{
                            backgroundColor: "#4f46e5",
                            borderRadius: 10,
                            minWidth: 20,
                            height: 20,
                            justifyContent: "center",
                            alignItems: "center",
                            paddingHorizontal: 6,
                            marginLeft: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color: "#fff",
                            }}
                          >
                            {item.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 1,
                  backgroundColor: "#f3f4f6",
                  marginLeft: 80,
                }}
              />
            )}
          />
        )}
      </View>
    </Modal>
  );
}
