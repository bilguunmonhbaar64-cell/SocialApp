import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function UserProfileActions({
  isFollowing,
  followLoading,
  onToggleFollow,
  onMessage,
}: {
  isFollowing: boolean;
  followLoading: boolean;
  onToggleFollow: () => void;
  onMessage: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 8,
        paddingBottom: 14,
      }}
    >
      <TouchableOpacity
        onPress={onToggleFollow}
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
                isFollowing ? "person-remove-outline" : "person-add-outline"
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
        onPress={onMessage}
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
  );
}
