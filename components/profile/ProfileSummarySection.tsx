import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

type ProfileSummarySectionProps = {
  avatarUri: string;
  displayName: string;
  bio?: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onOpenEditProfile: () => void;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
};

export default function ProfileSummarySection({
  avatarUri,
  displayName,
  bio,
  postsCount,
  followersCount,
  followingCount,
  onOpenEditProfile,
  onOpenFollowers,
  onOpenFollowing,
}: ProfileSummarySectionProps) {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity onPress={onOpenEditProfile}>
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

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-around",
            marginLeft: 20,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>
              {postsCount}
            </Text>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>posts</Text>
          </View>
          <TouchableOpacity onPress={onOpenFollowers} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>
              {followersCount}
            </Text>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>followers</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenFollowing} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>
              {followingCount}
            </Text>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>following</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
          {displayName}
        </Text>
        {bio ? (
          <Text
            style={{
              fontSize: 14,
              color: "#374151",
              marginTop: 3,
              lineHeight: 19,
            }}
          >
            {bio}
          </Text>
        ) : (
          <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 3 }}>
            Tap Edit Profile to add a bio ✨
          </Text>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={onOpenEditProfile}
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
    </>
  );
}
