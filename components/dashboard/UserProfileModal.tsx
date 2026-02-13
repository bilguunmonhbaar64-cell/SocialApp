import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import FollowListModal from "./FollowListModal";
import UserProfileActions from "./UserProfileActions";
import UserProfileHeader from "./UserProfileHeader";
import UserProfilePostsGrid from "./UserProfilePostsGrid";

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

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

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
            <UserProfileHeader
              profile={profile}
              postCount={postCount}
              followersCount={followersCount}
              followingCount={followingCount}
              onFollowersPress={openFollowersList}
              onFollowingPress={openFollowingList}
            />

            <UserProfileActions
              isFollowing={isFollowing}
              followLoading={followLoading}
              onToggleFollow={handleToggleFollow}
              onMessage={() => {
                if (profile && userId) {
                  onMessage(userId, profile.name, profile.avatarUrl || "");
                }
              }}
            />

            <UserProfilePostsGrid posts={posts} />
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

      <FollowListModal
        visible={followListVisible}
        title={followListTitle}
        users={followListUsers}
        loading={followListLoading}
        onClose={() => setFollowListVisible(false)}
      />
    </Modal>
  );
}
