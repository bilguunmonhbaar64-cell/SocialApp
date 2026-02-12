import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform as RNPlatform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  deleteStory as apiDeleteStory,
  sendMessage as apiSendMessage,
  toggleLike as apiToggleLike,
  viewStory as apiViewStory,
  createStory,
  fetchPosts,
  fetchStories,
  getConversations,
  getFollowersList,
  getFollowingList,
  getMe,
  getMessages,
  getUser,
  getUserProfile,
  searchUsers,
  seedPosts,
  toggleFollow,
  type ChatMessage,
  type ConversationItem,
  type Post,
  type PublicUserProfile,
  type SearchUserResult,
  type StoryGroup,
} from "../../services/api";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Helpers ────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// ─── Header ─────────────────────────────────────────────────────────────
function Header({
  avatarUrl,
  userName,
  onSearchPress,
  onChatPress,
}: {
  avatarUrl: string;
  userName: string;
  onSearchPress: () => void;
  onChatPress: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        paddingTop: insets.top + 6,
        paddingHorizontal: 14,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left: brand */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#4f46e5",
            letterSpacing: -0.5,
          }}
        >
          Connect
        </Text>

        {/* Right: action buttons */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#f9fafb",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="heart-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSearchPress}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#f9fafb",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="search-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onChatPress}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#f9fafb",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#6b7280"
            />

            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#ef4444",
                borderWidth: 1.5,
                borderColor: "#fff",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Story Viewer Modal ─────────────────────────────────────────────────
function StoryViewerModal({
  visible,
  storyGroup,
  onClose,
  currentUserId,
  onDeleted,
}: {
  visible: boolean;
  storyGroup: StoryGroup | null;
  onClose: () => void;
  currentUserId: string | null;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const isOwnStory = storyGroup?.user.id === currentUserId;
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const stories = storyGroup?.stories || [];
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (visible) setCurrentIndex(0);
  }, [visible, storyGroup]);

  useEffect(() => {
    if (!visible || !currentStory) return;

    // Mark as viewed
    if (currentUserId && currentStory.id) {
      apiViewStory(currentStory.id);
    }

    // Progress bar animation (5 seconds per story)
    progressAnim.setValue(0);
    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          onClose();
        }
      }
    });

    return () => anim.stop();
  }, [visible, currentIndex, currentStory]);

  if (!storyGroup || !currentStory) return null;

  const handleTap = (side: "left" | "right") => {
    if (side === "right") {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onClose();
      }
    } else {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* Story image */}
        <Image
          source={{ uri: currentStory.imageUrl }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          resizeMode="cover"
        />

        {/* Overlay top */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            paddingTop: 50,
            paddingHorizontal: 12,
          }}
        >
          {/* Progress bars */}
          <View style={{ flexDirection: "row", gap: 4, marginBottom: 12 }}>
            {stories.map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 2.5,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                {i < currentIndex ? (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#fff",
                    }}
                  />
                ) : i === currentIndex ? (
                  <Animated.View
                    style={{
                      height: "100%",
                      backgroundColor: "#fff",
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>

          {/* User info + close */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Image
                source={{
                  uri:
                    storyGroup.user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(storyGroup.user.name)}&background=4f46e5&color=fff`,
                }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 15,
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {storyGroup.user.name}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {timeAgo(currentStory.createdAt)}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {isOwnStory && (
                <TouchableOpacity
                  onPress={() => {
                    const story = stories[currentIndex];
                    if (!story) return;
                    Alert.alert("Delete Story", "Remove this story?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          setDeleting(true);
                          await apiDeleteStory(story.id);
                          setDeleting(false);
                          onClose();
                          onDeleted();
                        },
                      },
                    ]);
                  }}
                  disabled={deleting}
                >
                  <Ionicons name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Caption at bottom */}
        {currentStory.caption ? (
          <View
            style={{
              position: "absolute",
              bottom: 60,
              left: 16,
              right: 16,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                textAlign: "center",
                textShadowColor: "rgba(0,0,0,0.6)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {currentStory.caption}
            </Text>
          </View>
        ) : null}

        {/* Tap zones */}
        <View
          style={{
            position: "absolute",
            top: 100,
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => handleTap("left")}
          />
          <TouchableOpacity
            style={{ flex: 2 }}
            activeOpacity={1}
            onPress={() => handleTap("right")}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Chat Modal ─────────────────────────────────────────────────────────
function ChatModal({
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
      if (res.data) {
        setMessages(res.data.messages);
      }
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    })();
  }, [visible, userId]);

  // Poll for new messages every 4 seconds
  useEffect(() => {
    if (!visible || !userId) return;
    const interval = setInterval(async () => {
      const res = await getMessages(userId);
      if (res.data) {
        setMessages(res.data.messages);
      }
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
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else if (res.error) {
      Alert.alert("Error", res.error);
      setText(msgText);
    }
    setSending(false);
  };

  const formatMsgTime = (dateStr: string) => {
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
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={RNPlatform.OS === "ios" ? "padding" : undefined}
      >
        {/* Chat header */}
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

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {userName}
            </Text>
          </View>
        </View>

        {/* Messages list */}
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
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: insets.bottom + 8,
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
            backgroundColor: "#fff",
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
              style={{
                fontSize: 15,
                color: "#111827",
                maxHeight: 100,
              }}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={text}
              onChangeText={setText}
              multiline
              returnKeyType="default"
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

// ─── User Profile Modal ─────────────────────────────────────────────────
function UserProfileModal({
  visible,
  userId,
  onClose,
  onMessage,
}: {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
  onMessage: (userId: string, name: string, avatar: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Followers/following list modal
  const [followListVisible, setFollowListVisible] = useState(false);
  const [followListTitle, setFollowListTitle] = useState("Followers");
  const [followListUsers, setFollowListUsers] = useState<
    { id: string; name: string; avatarUrl?: string }[]
  >([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  useEffect(() => {
    if (!visible || !userId) return;
    setLoading(true);
    setProfile(null);
    setPosts([]);
    setIsFollowing(false);
    setFollowersCount(0);
    setFollowingCount(0);
    (async () => {
      const res = await getUserProfile(userId);
      if (res.data) {
        setProfile(res.data.user);
        setPosts(res.data.posts);
        setPostCount(res.data.postCount);
        setIsFollowing(res.data.isFollowing ?? false);
        setFollowersCount(res.data.user.followersCount ?? 0);
        setFollowingCount(res.data.user.followingCount ?? 0);
      }
      setLoading(false);
    })();
  }, [visible, userId]);

  const handleToggleFollow = async () => {
    if (!userId || followLoading) return;
    setFollowLoading(true);
    const res = await toggleFollow(userId);
    if (res.data) {
      setIsFollowing(res.data.isFollowing);
      setFollowersCount((c) =>
        res.data!.isFollowing ? c + 1 : Math.max(0, c - 1),
      );
    }
    setFollowLoading(false);
  };

  const openFollowersList = async () => {
    if (!userId) return;
    setFollowListTitle("Followers");
    setFollowListVisible(true);
    setFollowListLoading(true);
    setFollowListUsers([]);
    const res = await getFollowersList(userId);
    if (res.data) setFollowListUsers(res.data);
    setFollowListLoading(false);
  };

  const openFollowingList = async () => {
    if (!userId) return;
    setFollowListTitle("Following");
    setFollowListVisible(true);
    setFollowListLoading(true);
    setFollowListUsers([]);
    const res = await getFollowingList(userId);
    if (res.data) setFollowListUsers(res.data);
    setFollowListLoading(false);
  };

  const gridSize = (SCREEN_WIDTH - 6) / 3;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Header bar */}
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
            {profile?.name || "Profile"}
          </Text>
        </View>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : profile ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* IG-style: avatar left + stats right */}
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
              {profile.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: 43,
                    borderWidth: 3,
                    borderColor: "#4f46e5",
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: 43,
                    backgroundColor: "#e0e7ff",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 3,
                    borderColor: "#4f46e5",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: "#4f46e5",
                    }}
                  >
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}

              {/* Stats row */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  marginLeft: 20,
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {postCount}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}
                  >
                    Posts
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={openFollowersList}
                  style={{ alignItems: "center" }}
                  activeOpacity={0.6}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {followersCount}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}
                  >
                    Followers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openFollowingList}
                  style={{ alignItems: "center" }}
                  activeOpacity={0.6}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {followingCount}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}
                  >
                    Following
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Name & bio */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                {profile.name}
              </Text>
              {profile.bio ? (
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6b7280",
                    marginTop: 4,
                    lineHeight: 20,
                  }}
                >
                  {profile.bio}
                </Text>
              ) : null}
            </View>

            {/* Action buttons: Follow + Message */}
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 20,
                gap: 8,
                paddingBottom: 14,
              }}
            >
              <TouchableOpacity
                onPress={handleToggleFollow}
                disabled={followLoading}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isFollowing ? "#fff" : "#4f46e5",
                  borderRadius: 10,
                  paddingVertical: 10,
                  gap: 6,
                  borderWidth: isFollowing ? 1.5 : 0,
                  borderColor: "#d1d5db",
                }}
                activeOpacity={0.7}
              >
                {followLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={isFollowing ? "#4f46e5" : "#fff"}
                  />
                ) : (
                  <>
                    <Ionicons
                      name={
                        isFollowing
                          ? "person-remove-outline"
                          : "person-add-outline"
                      }
                      size={16}
                      color={isFollowing ? "#374151" : "#fff"}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: isFollowing ? "#374151" : "#fff",
                      }}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (profile && userId) {
                    onMessage(userId, profile.name, profile.avatarUrl || "");
                  }
                }}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f3f4f6",
                  borderRadius: 10,
                  paddingVertical: 10,
                  gap: 6,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#374151" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Message
                </Text>
              </TouchableOpacity>
            </View>

            {/* Posts section header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: "#f3f4f6",
                gap: 6,
              }}
            >
              <Ionicons name="grid-outline" size={16} color="#4f46e5" />
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}
              >
                Posts
              </Text>
            </View>

            {/* Posts grid */}
            {posts.length > 0 ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 2,
                  paddingHorizontal: 1,
                }}
              >
                {posts.map((post) => (
                  <View
                    key={post.id}
                    style={{
                      width: gridSize,
                      height: gridSize,
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
                            color: "#6b7280",
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
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="images-outline" size={40} color="#d1d5db" />
                <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 8 }}>
                  No posts yet
                </Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="person-outline" size={48} color="#d1d5db" />
            <Text style={{ fontSize: 15, color: "#9ca3af", marginTop: 8 }}>
              User not found
            </Text>
          </View>
        )}
      </View>

      {/* Followers / Following List Modal */}
      <Modal
        visible={followListVisible}
        animationType="slide"
        onRequestClose={() => setFollowListVisible(false)}
      >
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
              onPress={() => setFollowListVisible(false)}
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
              {followListTitle}
            </Text>
          </View>

          {followListLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : followListUsers.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text style={{ fontSize: 15, color: "#9ca3af", marginTop: 8 }}>
                No {followListTitle.toLowerCase()} yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={followListUsers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    gap: 12,
                  }}
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
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </Modal>
  );
}

// ─── Conversations Modal ────────────────────────────────────────────────
function ConversationsModal({
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

// ─── Search Modal ───────────────────────────────────────────────────────
function SearchModal({
  visible,
  onClose,
  onViewProfile,
}: {
  visible: boolean;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      setQuery("");
      setResults([]);
    }
  }, [visible]);

  const doSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 1) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await searchUsers(text.trim());
      if (res.data) setResults(res.data);
      setSearching(false);
    }, 350);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Search header */}
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
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f3f4f6",
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 42,
            }}
          >
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 15,
                color: "#111827",
              }}
              placeholder="Search people..."
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={doSearch}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => doSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        {searching && results.length === 0 ? (
          <View style={{ paddingVertical: 32, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#4f46e5" />
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 4 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onViewProfile(item.id)}
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
                <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
              </TouchableOpacity>
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
        ) : query.trim().length > 0 && !searching ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Ionicons name="people-outline" size={48} color="#d1d5db" />
            <Text
              style={{
                fontSize: 15,
                color: "#9ca3af",
                marginTop: 10,
                fontWeight: "500",
              }}
            >
              No users found
            </Text>
            <Text style={{ fontSize: 13, color: "#d1d5db", marginTop: 4 }}>
              Try a different search term
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Ionicons name="search" size={48} color="#e5e7eb" />
            <Text
              style={{
                fontSize: 15,
                color: "#9ca3af",
                marginTop: 10,
                fontWeight: "500",
              }}
            >
              Find people on Connect
            </Text>
            <Text style={{ fontSize: 13, color: "#d1d5db", marginTop: 4 }}>
              Search by name or email
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Stories Section ────────────────────────────────────────────────────
function StoriesSection({
  storyGroups,
  currentUserId,
  userAvatar,
  userName,
  onCreateStory,
  onViewStory,
}: {
  storyGroups: StoryGroup[];
  currentUserId: string | null;
  userAvatar: string;
  userName: string;
  onCreateStory: () => void;
  onViewStory: (group: StoryGroup) => void;
}) {
  const myGroup = storyGroups.find((g) => g.user.id === currentUserId);
  const otherGroups = storyGroups.filter((g) => g.user.id !== currentUserId);

  return (
    <View style={{ paddingTop: 6, paddingBottom: 6 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, gap: 6 }}
      >
        {/* Your Story / Add Story */}
        <TouchableOpacity
          onPress={myGroup ? () => onViewStory(myGroup) : onCreateStory}
          onLongPress={myGroup ? onCreateStory : undefined}
          style={{ alignItems: "center", width: 80 }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              padding: 3,
              backgroundColor: myGroup ? undefined : "#f3f4f6",
            }}
          >
            {myGroup && (
              <LinearGradient
                colors={["#4f46e5", "#7c3aed", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 40,
                }}
              />
            )}
            <View
              style={{
                flex: 1,
                borderRadius: 38,
                borderWidth: 2,
                borderColor: "#fff",
                overflow: "hidden",
                backgroundColor: "#f3f4f6",
              }}
            >
              <Image
                source={{
                  uri:
                    userAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff`,
                }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            {!myGroup && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  alignSelf: "center",
                  left: 28,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#4f46e5",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </View>
            )}
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: "#6b7280",
              marginTop: 8,
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {myGroup ? "Your Story" : "Add Story"}
          </Text>
        </TouchableOpacity>

        {/* Other users' stories */}
        {otherGroups.map((group) => (
          <TouchableOpacity
            key={group.user.id}
            onPress={() => onViewStory(group)}
            style={{ alignItems: "center", width: 80 }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                padding: 3,
              }}
            >
              <LinearGradient
                colors={["#facc15", "#ef4444", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 40,
                }}
              />
              <View
                style={{
                  flex: 1,
                  borderRadius: 38,
                  borderWidth: 2,
                  borderColor: "#fff",
                  overflow: "hidden",
                  backgroundColor: "#f3f4f6",
                }}
              >
                <Image
                  source={{
                    uri:
                      group.user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(group.user.name)}&background=4f46e5&color=fff`,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: "#6b7280",
                marginTop: 8,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {group.user.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Create Post Bar ────────────────────────────────────────────────────
function CreatePostBar({
  avatarUrl,
  userName,
}: {
  avatarUrl: string;
  userName: string;
}) {
  return (
    <View style={{ paddingHorizontal: 0, marginTop: 2, marginBottom: 6 }}>
      <View
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 0,
          padding: 12,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <Image
          source={{
            uri:
              avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff`,
          }}
          style={{ width: 36, height: 36, borderRadius: 18 }}
        />
        <TextInput
          style={{
            flex: 1,
            fontSize: 14,
            color: "#374151",
          }}
          placeholder="What's inspiring you?"
          placeholderTextColor="#9ca3af"
          editable={false}
        />
        <TouchableOpacity
          style={{
            padding: 8,
            borderRadius: 12,
          }}
        >
          <Ionicons name="image-outline" size={22} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Post Card ──────────────────────────────────────────────────────────
function PostCard({
  post,
  currentUserId,
  onLikeToggled,
}: {
  post: Post;
  currentUserId: string | null;
  onLikeToggled: (postId: string, liked: boolean, count: number) => void;
}) {
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(post.likes.length);

  const handleLike = async () => {
    const prev = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    const { data, error } = await apiToggleLike(post.id);
    if (error) {
      setLiked(prev);
      setLikeCount(prevCount);
    } else if (data) {
      setLiked(data.liked);
      setLikeCount(data.likeCount);
      onLikeToggled(post.id, data.liked, data.likeCount);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 0,
        marginHorizontal: 0,
        marginBottom: 6,
        overflow: "hidden",
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
      }}
    >
      {/* Header */}
      <View
        style={{
          padding: 12,
          paddingHorizontal: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Image
            source={{
              uri:
                post.author.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=4f46e5&color=fff`,
            }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
          <View>
            <Text
              style={{ fontSize: 14, fontWeight: "bold", color: "#111827" }}
            >
              {post.author.name}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingBottom: post.imageUrl ? 10 : 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#4b5563",
            lineHeight: 21,
          }}
        >
          {post.text}
        </Text>
      </View>

      {/* Image */}
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={{ width: "100%", height: SCREEN_WIDTH * 0.74 }}
          resizeMode="cover"
        />
      ) : null}

      {/* Actions */}
      <View
        style={{
          padding: 12,
          paddingHorizontal: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 20 }}>
          <TouchableOpacity
            onPress={handleLike}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "#ef4444" : "#6b7280"}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: liked ? "#ef4444" : "#6b7280",
              }}
            >
              {formatCount(likeCount)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#6b7280" />
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#6b7280" }}>
              {formatCount(post.comments.length)}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [userName, setUserName] = useState("User");
  const [viewingStory, setViewingStory] = useState<StoryGroup | null>(null);
  const [creatingStory, setCreatingStory] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<{
    userId: string;
    name: string;
    avatar: string;
  } | null>(null);
  const [convosVisible, setConvosVisible] = useState(false);

  const loadData = async () => {
    const [postsResult, storiesResult] = await Promise.all([
      fetchPosts(),
      fetchStories(),
    ]);

    if (postsResult.data && postsResult.data.length > 0) {
      setPosts(postsResult.data);
    } else if (postsResult.data && postsResult.data.length === 0) {
      console.log("[HOME] No posts found, seeding...");
      await seedPosts();
      const retry = await fetchPosts();
      if (retry.data) setPosts(retry.data);
    }

    if (storiesResult.data) {
      setStoryGroups(storiesResult.data);
    }

    if (postsResult.error)
      console.warn("[HOME] fetchPosts error:", postsResult.error);
    if (storiesResult.error)
      console.warn("[HOME] fetchStories error:", storiesResult.error);
  };

  useEffect(() => {
    (async () => {
      const meResult = await getMe();
      if (meResult.data) {
        setCurrentUserId(meResult.data.id);
        setUserAvatar(meResult.data.avatarUrl || "");
        setUserName(meResult.data.name);
      } else {
        const user = await getUser();
        if (user?.id) setCurrentUserId(user.id);
        if (user?.name) setUserName(user.name);
      }
      await loadData();
      setLoading(false);
    })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const meResult = await getMe();
    if (meResult.data) {
      setUserAvatar(meResult.data.avatarUrl || "");
      setUserName(meResult.data.name);
    }
    await loadData();
    setRefreshing(false);
  }, []);

  const handleLikeToggled = useCallback(
    (postId: string, liked: boolean, _count: number) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const newLikes = liked
            ? [...p.likes, currentUserId || ""]
            : p.likes.filter((id: string) => id !== currentUserId);
          return { ...p, likes: newLikes };
        }),
      );
    },
    [currentUserId],
  );

  // ─── Create Story ──────────────────────────────────────────────────
  const handleCreateStory = async () => {
    if (creatingStory) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow gallery access to create a story.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.3,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const mime = asset.mimeType || "image/jpeg";
    const imageData = asset.base64
      ? `data:${mime};base64,${asset.base64}`
      : asset.uri;

    setCreatingStory(true);
    const { data, error } = await createStory(imageData);
    setCreatingStory(false);

    if (error) {
      Alert.alert("Error", error);
      return;
    }

    // Refresh stories
    const storiesResult = await fetchStories();
    if (storiesResult.data) {
      setStoryGroups(storiesResult.data);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        currentUserId={currentUserId}
        onLikeToggled={handleLikeToggled}
      />
    ),
    [currentUserId, handleLikeToggled],
  );

  const ListHeader = useCallback(
    () => (
      <>
        <StoriesSection
          storyGroups={storyGroups}
          currentUserId={currentUserId}
          userAvatar={userAvatar}
          userName={userName}
          onCreateStory={handleCreateStory}
          onViewStory={(group) => setViewingStory(group)}
        />
        <CreatePostBar avatarUrl={userAvatar} userName={userName} />
      </>
    ),
    [storyGroups, currentUserId, userAvatar, userName, creatingStory],
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f9fafb",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Header
          avatarUrl={userAvatar}
          userName={userName}
          onSearchPress={() => setSearchVisible(true)}
          onChatPress={() => setConvosVisible(true)}
        />
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 12, color: "#9ca3af", fontSize: 14 }}>
          Loading posts...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header
        avatarUrl={userAvatar}
        userName={userName}
        onSearchPress={() => setSearchVisible(true)}
        onChatPress={() => setConvosVisible(true)}
      />

      {/* Creating story indicator */}
      {creatingStory && (
        <View
          style={{
            backgroundColor: "#4f46e5",
            paddingVertical: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ActivityIndicator size="small" color="#fff" />
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>
            Uploading story...
          </Text>
        </View>
      )}

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View
            style={{
              padding: 40,
              alignItems: "center",
            }}
          >
            <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
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
            <Text
              style={{
                fontSize: 13,
                color: "#d1d5db",
                marginTop: 4,
              }}
            >
              Be the first to share something!
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
            tintColor="#4f46e5"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      />

      {/* Story Viewer */}
      <StoryViewerModal
        visible={viewingStory !== null}
        storyGroup={viewingStory}
        onClose={() => setViewingStory(null)}
        currentUserId={currentUserId}
        onDeleted={async () => {
          const res = await fetchStories();
          if (res.data) setStoryGroups(res.data);
        }}
      />

      {/* Search Modal */}
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onViewProfile={(userId) => {
          setSearchVisible(false);
          setProfileUserId(userId);
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        visible={profileUserId !== null}
        userId={profileUserId}
        onClose={() => setProfileUserId(null)}
        onMessage={(uid, name, avatar) => {
          setProfileUserId(null);
          setChatTarget({ userId: uid, name, avatar });
        }}
      />

      {/* Conversations Modal */}
      <ConversationsModal
        visible={convosVisible}
        currentUserId={currentUserId}
        onClose={() => setConvosVisible(false)}
        onOpenChat={(userId, name, avatar) => {
          setConvosVisible(false);
          setChatTarget({ userId, name, avatar });
        }}
      />

      {/* Chat Modal */}
      <ChatModal
        visible={chatTarget !== null}
        userId={chatTarget?.userId ?? null}
        userName={chatTarget?.name ?? ""}
        userAvatar={chatTarget?.avatar ?? ""}
        currentUserId={currentUserId}
        onClose={() => setChatTarget(null)}
      />
    </View>
  );
}
