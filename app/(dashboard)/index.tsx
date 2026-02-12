import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Data ───────────────────────────────────────────────────────────────
const STORIES = [
  {
    id: "create",
    user: "You",
    img: "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/2776305cb7c74b518445877395b6fd1b.jpg",
    isUser: true,
  },
  {
    id: "1",
    user: "Otgonbaatar",
    img: "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/a7e56b5d9a414333af36830c7313b44c.jpg",
    avatar:
      "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/a7e56b5d9a414333af36830c7313b44c.jpg",
  },
  {
    id: "2",
    user: "Azaa Bkh",
    img: "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/d99cd5cf3e8545fc9bbbe28515c97d7a.jpg",
    avatar:
      "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/d99cd5cf3e8545fc9bbbe28515c97d7a.jpg",
  },
  {
    id: "3",
    user: "Sarah J",
    img: "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/b7bdf2c10ad1425584a9d25f105f6e8e.jpg",
    avatar:
      "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/b7bdf2c10ad1425584a9d25f105f6e8e.jpg",
  },
];

const POSTS = [
  {
    id: "1",
    user: "Urgoo Cinema",
    username: "@urgoocinema",
    avatar:
      "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/c85092476493499e9c7bcf274a7868a0.jpg",
    time: "2h ago",
    content:
      'Christopher Nolan\'s "The Dark Knight" inspired Timothee Chalamet to become an actor. A masterpiece that changed cinema forever. 🎬✨',
    image:
      "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/f5d02131c15447ea9320de112b4b1f67.jpg",
    likes: "1.2K",
    comments: "45",
    shares: "12",
  },
  {
    id: "2",
    user: "Nature Collective",
    username: "@nature_co",
    avatar:
      "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/5fb5f9df61ed4df3a886fd97ecd87794.jpg",
    time: "4h ago",
    content:
      "Silence speaks when words can't. The winter solitude is magical. ❄️🏔️",
    image:
      "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/5fb5f9df61ed4df3a886fd97ecd87794.jpg",
    likes: "856",
    comments: "23",
    shares: "5",
  },
  {
    id: "3",
    user: "Sarnai Tsetseg",
    username: "@sarnai_t",
    avatar: "https://i.pravatar.cc/150?img=13",
    time: "6h ago",
    content:
      "Just finished my first marathon! 🏃‍♀️ So proud of this achievement! Never give up on your dreams 💪",
    image: "",
    likes: "324",
    comments: "56",
    shares: "8",
  },
  {
    id: "4",
    user: "Enkhjin Bat",
    username: "@enkhjin.dev",
    avatar: "https://i.pravatar.cc/150?img=15",
    time: "8h ago",
    content:
      "New workspace, new energy! 🖥️✨ Working from home has never felt this good.",
    image: "https://picsum.photos/800/500?random=6",
    likes: "67",
    comments: "12",
    shares: "1",
  },
];

// ─── Header ─────────────────────────────────────────────────────────────
function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        paddingTop: insets.top,
        paddingHorizontal: 10,
        paddingBottom: 6,
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
        <Text
          style={{
            fontSize: 26,
            fontWeight: "bold",
            color: "#4f46e5",
            letterSpacing: -0.5,
          }}
        >
          Connect
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#f9fafb",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="search-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
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

// ─── Stories ─────────────────────────────────────────────────────────────
function StoriesSection() {
  return (
    <View style={{ paddingTop: 6, paddingBottom: 6 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 6, gap: 8 }}
      >
        {STORIES.map((story) => (
          <TouchableOpacity
            key={story.id}
            style={{ alignItems: "center", width: 88 }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                padding: 3,
                ...(story.isUser ? { backgroundColor: "#f3f4f6" } : {}),
              }}
            >
              {!story.isUser && (
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
                    borderRadius: 44,
                  }}
                />
              )}
              <View
                style={{
                  flex: 1,
                  borderRadius: 42,
                  borderWidth: 2,
                  borderColor: "#fff",
                  overflow: "hidden",
                  backgroundColor: "#f3f4f6",
                }}
              >
                <Image
                  source={{ uri: story.img }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
                {story.isUser && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.15)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </View>
                )}
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
              {story.user}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Create Post ────────────────────────────────────────────────────────
function CreatePostBar() {
  return (
    <View style={{ paddingHorizontal: 6, marginTop: 4, marginBottom: 8 }}>
      <View
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 20,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: "#f3f4f6",
        }}
      >
        <Image
          source={{
            uri: "https://public.youware.com/users-website-assets/prod/a75881b7-308c-4271-80ce-76a6227bc546/2776305cb7c74b518445877395b6fd1b.jpg",
          }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
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
function PostCard({ post }: { post: (typeof POSTS)[0] }) {
  const [liked, setLiked] = useState(false);

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 14,
        marginHorizontal: 6,
        marginBottom: 8,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f3f4f6",
      }}
    >
      {/* Header */}
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Image
            source={{ uri: post.avatar }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
          <View>
            <Text
              style={{ fontSize: 14, fontWeight: "bold", color: "#111827" }}
            >
              {post.user}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {post.username} · {post.time}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View
        style={{ paddingHorizontal: 16, paddingBottom: post.image ? 14 : 16 }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#4b5563",
            lineHeight: 21,
          }}
        >
          {post.content}
        </Text>
      </View>

      {/* Image */}
      {post.image ? (
        <Image
          source={{ uri: post.image }}
          style={{ width: "100%", height: SCREEN_WIDTH * 0.74 }}
          resizeMode="cover"
        />
      ) : null}

      {/* Actions */}
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 20 }}>
          <TouchableOpacity
            onPress={() => setLiked(!liked)}
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
              {post.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#6b7280" />
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#6b7280" }}>
              {post.comments}
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
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof POSTS)[0] }) => <PostCard post={item} />,
    [],
  );

  const ListHeader = useCallback(
    () => (
      <>
        <StoriesSection />
        <CreatePostBar />
      </>
    ),
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header />
      <FlatList
        data={POSTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
            tintColor="#4f46e5"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 12 }}
      />
    </View>
  );
}
