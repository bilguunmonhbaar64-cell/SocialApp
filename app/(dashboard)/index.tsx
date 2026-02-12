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
  Modal,
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
  toggleLike as apiToggleLike,
  viewStory as apiViewStory,
  createStory,
  deleteStory as apiDeleteStory,
  fetchPosts,
  fetchStories,
  getMe,
  getUser,
  seedPosts,
  type Post,
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
}: {
  avatarUrl: string;
  userName: string;
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
        <Header avatarUrl={userAvatar} userName={userName} />
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
      <Header avatarUrl={userAvatar} userName={userName} />

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
    </View>
  );
}
