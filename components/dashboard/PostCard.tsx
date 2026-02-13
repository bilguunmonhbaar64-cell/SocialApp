import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  toggleLike as apiToggleLike,
  type Post,
} from "../../services/api";
import { formatCount, timeAgo } from "./helpers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Create Post Bar ────────────────────────────────────────────────────
export function CreatePostBar({
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
export default function PostCard({
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
