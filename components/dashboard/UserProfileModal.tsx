import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getFollowersList,
  getFollowingList,
  getUserProfile,
  toggleFollow,
  type Post,
  type PublicUserProfile,
} from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function UserProfileModal({
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
