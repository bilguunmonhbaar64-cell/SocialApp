import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getConversations,
  getMe,
  getMessages,
  searchUsers,
  sendMessage as apiSendMessage,
  type ChatMessage,
  type ConversationItem,
} from "../../services/api";

// ─── Chat Screen ────────────────────────────────────────────────────────
function ChatScreen({
  userId,
  userName,
  userAvatar,
  currentUserId,
  onBack,
}: {
  userId: string;
  userName: string;
  userAvatar: string;
  currentUserId: string | null;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    (async () => {
      const res = await getMessages(userId);
      if (res.data) setMessages(res.data.messages);
      setLoading(false);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: false }),
        200,
      );
    })();
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await getMessages(userId);
      if (res.data) setMessages(res.data.messages);
    }, 4000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText("");
    setSending(true);
    const res = await apiSendMessage(userId, msgText);
    if (res.data) {
      setMessages((prev) => [...prev, res.data!]);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    } else if (res.error) {
      Alert.alert("Error", res.error);
      setText(msgText);
    }
    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const time = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (diffDays === 0) return time;
    if (diffDays === 1) return `Yesterday ${time}`;
    if (diffDays < 7)
      return `${d.toLocaleDateString([], { weekday: "short" })} ${time}`;
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          maxWidth: "78%",
          marginVertical: 3,
          marginHorizontal: 14,
        }}
      >
        {!isMe && (
          <View
            style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}
          >
            <Image
              source={{
                uri:
                  userAvatar ||
                  `https://ui-avatars.com/api/?name=${userName}`,
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                marginBottom: 18,
              }}
            />
            <View>
              <View
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: 20,
                  borderBottomLeftRadius: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{ fontSize: 15, color: "#111827", lineHeight: 20 }}
                >
                  {item.text}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  marginTop: 3,
                  marginLeft: 4,
                }}
              >
                {formatTime(item.createdAt)}
              </Text>
            </View>
          </View>
        )}
        {isMe && (
          <View>
            <View
              style={{
                backgroundColor: "#4f46e5",
                borderRadius: 20,
                borderBottomRightRadius: 4,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontSize: 15, color: "#fff", lineHeight: 20 }}>
                {item.text}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 10,
                color: "#9ca3af",
                marginTop: 3,
                alignSelf: "flex-end",
                marginRight: 4,
              }}
            >
              {formatTime(item.createdAt)}
              {item.read ? "  ✓✓" : "  ✓"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Chat Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 14,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#f3f4f6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>

        <Image
          source={{
            uri:
              userAvatar ||
              `https://ui-avatars.com/api/?name=${userName}`,
          }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
            {userName}
          </Text>
          <Text style={{ fontSize: 12, color: "#22c55e", fontWeight: "500" }}>
            Active now
          </Text>
        </View>

        <TouchableOpacity
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#f3f4f6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="call-outline" size={18} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#f3f4f6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="videocam-outline" size={18} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: 16,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? "center" : "flex-end",
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 40 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#f0f0ff",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="hand-right-outline"
                  size={36}
                  color="#4f46e5"
                />
              </View>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
              >
                Say hello!
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#9ca3af",
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                Start a conversation with {userName}
              </Text>
            </View>
          }
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />
      )}

      {/* Input Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          gap: 10,
        }}
      >
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#f3f4f6",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="camera-outline" size={20} color="#4f46e5" />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            backgroundColor: "#f3f4f6",
            borderRadius: 22,
            paddingHorizontal: 16,
            paddingVertical: Platform.OS === "ios" ? 10 : 6,
            maxHeight: 120,
          }}
        >
          <TextInput
            style={{ fontSize: 15, color: "#111827", maxHeight: 100 }}
            placeholder="Message..."
            placeholderTextColor="#9ca3af"
            value={text}
            onChangeText={setText}
            multiline
          />
        </View>

        {text.trim() ? (
          <TouchableOpacity
            onPress={handleSend}
            disabled={sending}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: sending ? "#c7d2fe" : "#4f46e5",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={17} color="#fff" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: "row", gap: 4 }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#f3f4f6",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="mic-outline" size={20} color="#4f46e5" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#f3f4f6",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="image-outline" size={20} color="#4f46e5" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Messages Tab Screen ────────────────────────────────────────────────
export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [chatTarget, setChatTarget] = useState<{
    userId: string;
    name: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (me.data) setCurrentUserId(me.data.id);
    })();
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    const res = await getConversations();
    if (res.data) setConversations(res.data);
    setLoading(false);
  };

  // Poll when on conversation list
  useEffect(() => {
    if (chatTarget) return;
    const interval = setInterval(async () => {
      const res = await getConversations();
      if (res.data) setConversations(res.data);
    }, 5000);
    return () => clearInterval(interval);
  }, [chatTarget]);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchUsers(searchQuery.trim());
      if (res.data) setSearchResults(res.data);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // ── Chat view ─────────────────────────────────────────────────────────
  if (chatTarget) {
    return (
      <ChatScreen
        userId={chatTarget.userId}
        userName={chatTarget.name}
        userAvatar={chatTarget.avatar}
        currentUserId={currentUserId}
        onBack={() => {
          setChatTarget(null);
          loadConversations();
        }}
      />
    );
  }

  // ── Conversations list ────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 6,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: "#111827",
              letterSpacing: -0.5,
            }}
          >
            Messages
          </Text>

          <TouchableOpacity
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#f3f4f6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="create-outline" size={19} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f3f4f6",
            borderRadius: 12,
            paddingHorizontal: 12,
            marginTop: 14,
            marginBottom: 10,
            height: 40,
            gap: 8,
          }}
        >
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={{
              flex: 1,
              fontSize: 15,
              color: "#111827",
              paddingVertical: 0,
            }}
            placeholder="Search messages..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {searchQuery.trim().length > 0 ? (
        <View style={{ flex: 1 }}>
          {searching ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : searchResults.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="search-outline" size={48} color="#e5e7eb" />
              <Text
                style={{
                  fontSize: 15,
                  color: "#9ca3af",
                  fontWeight: "600",
                  marginTop: 12,
                }}
              >
                No users found
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setChatTarget({
                      userId: item.id,
                      name: item.name,
                      avatar: item.avatarUrl || "",
                    });
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                  }}
                  activeOpacity={0.6}
                >
                  {item.avatarUrl ? (
                    <Image
                      source={{ uri: item.avatarUrl }}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#e0e7ff",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: "#4f46e5",
                        }}
                      >
                        {item.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      {item.name}
                    </Text>
                    {item.username && (
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#9ca3af",
                          marginTop: 2,
                        }}
                      >
                        @{item.username}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      ) : loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : conversations.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#f0f0ff",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="chatbubbles-outline" size={44} color="#4f46e5" />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 6,
            }}
          >
            No messages yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#9ca3af",
              textAlign: "center",
              maxWidth: 260,
              lineHeight: 20,
            }}
          >
            Search for people to start a conversation and connect with friends
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.user.id}
          contentContainerStyle={{ paddingTop: 8 }}
          renderItem={({ item }) => {
            const isMyMsg = item.lastMessage.senderId === currentUserId;
            const hasUnread = item.unreadCount > 0;

            return (
              <TouchableOpacity
                onPress={() =>
                  setChatTarget({
                    userId: item.user.id,
                    name: item.user.name,
                    avatar: item.user.avatarUrl || "",
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  gap: 14,
                }}
                activeOpacity={0.6}
              >
                {/* Avatar with online indicator */}
                <View>
                  {item.user.avatarUrl ? (
                    <Image
                      source={{ uri: item.user.avatarUrl }}
                      style={{ width: 56, height: 56, borderRadius: 28 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: "#e0e7ff",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 22,
                          fontWeight: "700",
                          color: "#4f46e5",
                        }}
                      >
                        {item.user.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                  )}
                  <View
                    style={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: "#22c55e",
                      borderWidth: 2.5,
                      borderColor: "#fff",
                    }}
                  />
                </View>

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
                        fontSize: 16,
                        fontWeight: hasUnread ? "700" : "600",
                        color: "#111827",
                      }}
                    >
                      {item.user.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: hasUnread ? "#4f46e5" : "#9ca3af",
                        fontWeight: hasUnread ? "600" : "400",
                      }}
                    >
                      {formatTime(item.lastMessage.createdAt)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 14,
                        color: hasUnread ? "#374151" : "#9ca3af",
                        fontWeight: hasUnread ? "500" : "400",
                      }}
                      numberOfLines={1}
                    >
                      {isMyMsg ? "You: " : ""}
                      {item.lastMessage.text}
                    </Text>

                    {hasUnread && (
                      <View
                        style={{
                          backgroundColor: "#4f46e5",
                          borderRadius: 11,
                          minWidth: 22,
                          height: 22,
                          justifyContent: "center",
                          alignItems: "center",
                          paddingHorizontal: 7,
                          marginLeft: 10,
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
                marginLeft: 86,
              }}
            />
          )}
        />
      )}
    </View>
  );
}
