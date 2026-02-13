import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type ProfileHeaderProps = {
  title: string;
  topInset: number;
  onOpenMessages: () => void;
};

export default function ProfileHeader({
  title,
  topInset,
  onOpenMessages,
}: ProfileHeaderProps) {
  return (
    <View
      style={{
        paddingTop: topInset + 6,
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
        {title}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          onPress={onOpenMessages}
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
  );
}
