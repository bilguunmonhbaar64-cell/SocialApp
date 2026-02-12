import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  sendMessage as apiSendMessage,
  changePassword,
  clearAuth,
  deleteAccount,
  fetchPosts,
  getConversations,
  getFollowersList,
  getFollowingList,
  getMe,
  getMessages,
  updateProfile,
  type ChatMessage,
  type ConversationItem,
  type Post,
  type SearchUserResult,
  type UserProfile,
} from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SIZE = (SCREEN_WIDTH - 4) / 3;

// ─── Users List Modal (followers/following) ─────────────────────────────
function UsersListModal({
  visible,
  title,
  users,
  loading,
  onClose,
}: {
  visible: boolean;
  title: string;
  users: SearchUserResult[];
  loading: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            paddingTop: insets.top + 6,
            paddingHorizontal: 14,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
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
            {title}
          </Text>
        </View>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 4 }}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  gap: 12,
                }}
              >
                {item.avatarUrl ? (
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: "#f3f4f6",
                    }}
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
                  {item.bio ? (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        marginTop: 2,
                      }}
                      numberOfLines={1}
                    >
                      {item.bio}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 1,
                  backgroundColor: "#f3f4f6",
                  marginLeft: 76,
                }}
              />
            )}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="people-outline" size={48} color="#d1d5db" />
            <Text
              style={{
                fontSize: 15,
                color: "#9ca3af",
                marginTop: 10,
                fontWeight: "500",
              }}
            >
              No {title.toLowerCase()} yet
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Conversations List Modal ───────────────────────────────────────────
function ConversationsModal({
  visible,
  onClose,
  currentUserId,
}: {
  visible: boolean;
  onClose: () => void;
  currentUserId: string | null;
}) {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatTarget, setChatTarget] = useState<{
    userId: string;
    name: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    (async () => {
      const res = await getConversations();
      if (res.data) setConversations(res.data);
      setLoading(false);
    })();
  }, [visible]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            paddingTop: insets.top + 6,
            paddingHorizontal: 14,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
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
        ) : conversations.length > 0 ? (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.user.id}
            contentContainerStyle={{ paddingVertical: 4 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  setChatTarget({
                    userId: item.user.id,
                    name: item.user.name,
                    avatar: item.user.avatarUrl,
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  gap: 12,
                }}
                activeOpacity={0.6}
              >
                {item.user.avatarUrl ? (
                  <Image
                    source={{ uri: item.user.avatarUrl }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: "#f3f4f6",
                    }}
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
                    <Text style={{ fontSize: 12, color: "#9ca3af" }}>
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
                        fontWeight: item.unreadCount > 0 ? "600" : "400",
                      }}
                      numberOfLines={1}
                    >
                      {item.lastMessage.senderId === currentUserId
                        ? "You: "
                        : ""}
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
            )}
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
        ) : (
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
              No messages yet
            </Text>
            <Text style={{ fontSize: 13, color: "#d1d5db", marginTop: 4 }}>
              Start a conversation from someone's profile
            </Text>
          </View>
        )}
      </View>

      {/* Inline Chat */}
      <InlineChatModal
        visible={chatTarget !== null}
        userId={chatTarget?.userId ?? null}
        userName={chatTarget?.name ?? ""}
        userAvatar={chatTarget?.avatar ?? ""}
        currentUserId={currentUserId}
        onClose={() => setChatTarget(null)}
      />
    </Modal>
  );
}

// ─── Inline Chat Modal ──────────────────────────────────────────────────
function InlineChatModal({
  visible,
  userId,
  userName,
  userAvatar,
  currentUserId,
  onClose,
}: {
  visible: boolean;
  userId: string | null;
  userName: string;
  userAvatar: string;
  currentUserId: string | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!visible || !userId) return;
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
  }, [visible, userId]);

  useEffect(() => {
    if (!visible || !userId) return;
    const interval = setInterval(async () => {
      const res = await getMessages(userId);
      if (res.data) setMessages(res.data.messages);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible, userId]);

  const handleSend = async () => {
    if (!text.trim() || !userId || sending) return;
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

  const formatMsgTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 6,
            paddingHorizontal: 14,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
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
          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          ) : (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#e0e7ff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#4f46e5" }}
              >
                {userName?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <Text
            style={{
              flex: 1,
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
            }}
          >
            {userName}
          </Text>
        </View>

        {/* Messages */}
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
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingVertical: 12,
              flexGrow: 1,
              justifyContent: messages.length === 0 ? "center" : "flex-end",
            }}
            ListEmptyComponent={
              <View style={{ alignItems: "center", padding: 40 }}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={56}
                  color="#e5e7eb"
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#9ca3af",
                    marginTop: 12,
                  }}
                >
                  No messages yet
                </Text>
                <Text style={{ fontSize: 13, color: "#d1d5db", marginTop: 4 }}>
                  Say hello to {userName}!
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMe = item.senderId === currentUserId;
              return (
                <View
                  style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    maxWidth: "78%",
                    marginVertical: 3,
                    marginHorizontal: 12,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: isMe ? "#4f46e5" : "#f3f4f6",
                      borderRadius: 18,
                      borderBottomRightRadius: isMe ? 4 : 18,
                      borderBottomLeftRadius: isMe ? 18 : 4,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: isMe ? "#fff" : "#111827",
                        lineHeight: 20,
                      }}
                    >
                      {item.text}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      marginTop: 3,
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      marginHorizontal: 4,
                    }}
                  >
                    {formatMsgTime(item.createdAt)}
                    {isMe && item.read ? "  ✓✓" : ""}
                  </Text>
                </View>
              );
            }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: insets.bottom + 8,
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
            gap: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#f3f4f6",
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              maxHeight: 120,
            }}
          >
            <TextInput
              style={{ fontSize: 15, color: "#111827", maxHeight: 100 }}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={text}
              onChangeText={setText}
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: text.trim() && !sending ? "#4f46e5" : "#e5e7eb",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 1,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Profile Screen ────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit profile modal
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  // Change password modal
  const [pwVisible, setPwVisible] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  // Followers / following modals
  const [followListVisible, setFollowListVisible] = useState(false);
  const [followListTitle, setFollowListTitle] = useState("Followers");
  const [followListUsers, setFollowListUsers] = useState<SearchUserResult[]>(
    [],
  );
  const [followListLoading, setFollowListLoading] = useState(false);

  // Conversations modal
  const [convosVisible, setConvosVisible] = useState(false);

  const loadData = async () => {
    const [profileRes, postsRes] = await Promise.all([getMe(), fetchPosts()]);
    if (profileRes.data) {
      setProfile(profileRes.data);
    }
    if (postsRes.data && profileRes.data) {
      const mine = postsRes.data.filter(
        (p) => p.author.id === profileRes.data!.id,
      );
      setMyPosts(mine);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    await clearAuth();
    router.replace("/(tabs)");
  };

  const openEditProfile = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditBio(profile.bio || "");
    setEditAvatar(profile.avatarUrl || "");
    setEditVisible(true);
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      const mime = result.assets[0].mimeType || "image/jpeg";
      setEditAvatar(`data:${mime};base64,${result.assets[0].base64}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setSaving(true);
    const { data, error } = await updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      avatarUrl: editAvatar || undefined,
    });
    setSaving(false);
    if (error) {
      Alert.alert("Error", error);
      return;
    }
    if (data) setProfile(data);
    setEditVisible(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      Alert.alert("Error", "Please fill in both fields");
      return;
    }
    if (newPw.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }
    setChangingPw(true);
    const { error } = await changePassword(currentPw, newPw);
    setChangingPw(false);
    if (error) {
      Alert.alert("Error", error);
      return;
    }
    Alert.alert("Success", "Password updated!");
    setPwVisible(false);
    setCurrentPw("");
    setNewPw("");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all posts. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) {
              Alert.alert("Error", error);
              return;
            }
            router.replace("/(tabs)");
          },
        },
      ],
    );
  };

  const openFollowers = async () => {
    if (!profile) return;
    setFollowListTitle("Followers");
    setFollowListUsers([]);
    setFollowListLoading(true);
    setFollowListVisible(true);
    const res = await getFollowersList(profile.id);
    if (res.data) setFollowListUsers(res.data);
    setFollowListLoading(false);
  };

  const openFollowing = async () => {
    if (!profile) return;
    setFollowListTitle("Following");
    setFollowListUsers([]);
    setFollowListLoading(true);
    setFollowListVisible(true);
    const res = await getFollowingList(profile.id);
    if (res.data) setFollowListUsers(res.data);
    setFollowListLoading(false);
  };

  const avatarUri =
    profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "U")}&background=4f46e5&color=fff&size=200`;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>
          {profile?.name || "Profile"}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setConvosVisible(true)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: "#f3f4f6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: "#f3f4f6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="menu-outline" size={22} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
            tintColor="#4f46e5"
          />
        }
      >
        {/* Profile row: avatar + stats */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 12,
          }}
        >
          {/* Avatar */}
          <TouchableOpacity onPress={openEditProfile}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                borderWidth: 3,
                borderColor: "#4f46e5",
                padding: 2,
              }}
            >
              <Image
                source={{ uri: avatarUri }}
                style={{ width: "100%", height: "100%", borderRadius: 40 }}
              />
            </View>
          </TouchableOpacity>

          {/* Stats row */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-around",
              marginLeft: 20,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}
              >
                {myPosts.length}
              </Text>
              <Text style={{ fontSize: 13, color: "#6b7280" }}>posts</Text>
            </View>
            <TouchableOpacity
              onPress={openFollowers}
              style={{ alignItems: "center" }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}
              >
                {profile?.followersCount ?? 0}
              </Text>
              <Text style={{ fontSize: 13, color: "#6b7280" }}>followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openFollowing}
              style={{ alignItems: "center" }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}
              >
                {profile?.followingCount ?? 0}
              </Text>
              <Text style={{ fontSize: 13, color: "#6b7280" }}>following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name & bio */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
            {profile?.name || "User"}
          </Text>
          {profile?.bio ? (
            <Text
              style={{
                fontSize: 14,
                color: "#374151",
                marginTop: 3,
                lineHeight: 19,
              }}
            >
              {profile.bio}
            </Text>
          ) : (
            <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 3 }}>
              Tap Edit Profile to add a bio ✨
            </Text>
          )}
        </View>

        {/* Action buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={openEditProfile}
            style={{
              flex: 1,
              backgroundColor: "#f3f4f6",
              paddingVertical: 9,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#111827", fontWeight: "600", fontSize: 14 }}>
              Edit profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "#f3f4f6",
              paddingVertical: 9,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#111827", fontWeight: "600", fontSize: 14 }}>
              Share profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 38,
              backgroundColor: "#f3f4f6",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="person-add-outline" size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Grid tab bar */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 40,
              paddingVertical: 12,
            }}
          >
            <View
              style={{
                borderBottomWidth: 2,
                borderBottomColor: "#111827",
                paddingBottom: 10,
              }}
            >
              <Ionicons name="grid-outline" size={22} color="#111827" />
            </View>
            <TouchableOpacity>
              <Ionicons name="play-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>

          {/* Posts grid */}
          {myPosts.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 2,
                paddingHorizontal: 1,
              }}
            >
              {myPosts.map((post) => (
                <View
                  key={post.id}
                  style={{
                    width: GRID_SIZE,
                    height: GRID_SIZE,
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  {post.imageUrl ? (
                    <Image
                      source={{ uri: post.imageUrl }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 8,
                        backgroundColor: "#eef2ff",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#4f46e5",
                          textAlign: "center",
                        }}
                        numberOfLines={4}
                      >
                        {post.text}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: "center", padding: 40 }}>
              <Ionicons name="camera-outline" size={48} color="#d1d5db" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#9ca3af",
                  marginTop: 12,
                }}
              >
                No posts yet
              </Text>
              <Text style={{ fontSize: 13, color: "#d1d5db", marginTop: 4 }}>
                Share your first post!
              </Text>
            </View>
          )}
        </View>

        {/* Settings section */}
        <View
          style={{
            marginTop: 24,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
            paddingTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Settings
          </Text>
          {(
            [
              {
                icon: "person-outline",
                label: "Edit Profile",
                color: "#4f46e5",
                onPress: openEditProfile,
              },
              {
                icon: "lock-closed-outline",
                label: "Change Password",
                color: "#10b981",
                onPress: () => setPwVisible(true),
              },
              {
                icon: "chatbubble-ellipses-outline",
                label: "Messages",
                color: "#0ea5e9",
                onPress: () => setConvosVisible(true),
              },
              {
                icon: "notifications-outline",
                label: "Notification Settings",
                color: "#f59e0b",
                onPress: () => {},
              },
              {
                icon: "help-circle-outline",
                label: "Help & Support",
                color: "#6b7280",
                onPress: () => {},
              },
              {
                icon: "trash-outline",
                label: "Delete Account",
                color: "#ef4444",
                onPress: handleDeleteAccount,
              },
            ] as const
          ).map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                gap: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#f3f4f6",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: item.color + "15",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.color}
                />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: "500",
                  color: item.color === "#ef4444" ? "#ef4444" : "#374151",
                }}
              >
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginHorizontal: 20,
            marginTop: 24,
            marginBottom: 40,
            paddingVertical: 14,
            borderRadius: 14,
            backgroundColor: "#fef2f2",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#fecaca",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#ef4444" }}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Edit Profile Modal ────────────────────────────────────── */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 16,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 20,
              maxHeight: "85%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Text style={{ fontSize: 16, color: "#6b7280" }}>Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
              >
                Edit Profile
              </Text>
              <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#4f46e5" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#4f46e5",
                    }}
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={pickAvatar}
                style={{ alignItems: "center", marginBottom: 24 }}
              >
                <Image
                  source={{
                    uri:
                      editAvatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(editName || "U")}&background=4f46e5&color=fff&size=200`,
                  }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#f3f4f6",
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#4f46e5",
                    marginTop: 8,
                  }}
                >
                  Change Photo
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#f3f4f6",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: "#111827",
                  marginBottom: 16,
                }}
                placeholder="Your name"
                placeholderTextColor="#9ca3af"
              />

              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Bio
              </Text>
              <TextInput
                value={editBio}
                onChangeText={setEditBio}
                multiline
                maxLength={160}
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#f3f4f6",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: "#111827",
                  minHeight: 80,
                  textAlignVertical: "top",
                  marginBottom: 8,
                }}
                placeholder="Write a short bio..."
                placeholderTextColor="#9ca3af"
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  textAlign: "right",
                  marginBottom: 20,
                }}
              >
                {editBio.length}/160
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Change Password Modal ─────────────────────────────────── */}
      <Modal visible={pwVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 16,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setPwVisible(false);
                  setCurrentPw("");
                  setNewPw("");
                }}
              >
                <Text style={{ fontSize: 16, color: "#6b7280" }}>Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
              >
                Change Password
              </Text>
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={changingPw}
              >
                {changingPw ? (
                  <ActivityIndicator size="small" color="#4f46e5" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#4f46e5",
                    }}
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: 6,
              }}
            >
              Current Password
            </Text>
            <TextInput
              value={currentPw}
              onChangeText={setCurrentPw}
              secureTextEntry
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#f3f4f6",
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: "#111827",
                marginBottom: 16,
              }}
              placeholder="Enter current password"
              placeholderTextColor="#9ca3af"
            />

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: 6,
              }}
            >
              New Password
            </Text>
            <TextInput
              value={newPw}
              onChangeText={setNewPw}
              secureTextEntry
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#f3f4f6",
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: "#111827",
                marginBottom: 8,
              }}
              placeholder="Min 8 characters"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      </Modal>

      {/* ── Followers/Following List Modal ─────────────────────────── */}
      <UsersListModal
        visible={followListVisible}
        title={followListTitle}
        users={followListUsers}
        loading={followListLoading}
        onClose={() => setFollowListVisible(false)}
      />

      {/* ── Conversations Modal ────────────────────────────────────── */}
      <ConversationsModal
        visible={convosVisible}
        onClose={() => setConvosVisible(false)}
        currentUserId={profile?.id ?? null}
      />
    </View>
  );
}
