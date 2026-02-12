import { Ionicons } from "@expo/vector-icons";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVITIES = [
  {
    id: "1",
    type: "like",
    user: "Munkhjin",
    avatar: "https://i.pravatar.cc/150?img=30",
    text: "liked your photo.",
    time: "2m",
    postImage: "https://picsum.photos/100/100?random=60",
    read: false,
  },
  {
    id: "2",
    type: "follow",
    user: "Azaa Bkh",
    avatar: "https://i.pravatar.cc/150?img=31",
    text: "started following you.",
    time: "15m",
    postImage: null,
    read: false,
  },
  {
    id: "3",
    type: "comment",
    user: "Tuvshin Bold",
    avatar: "https://i.pravatar.cc/150?img=32",
    text: 'commented: "This looks amazing! 🔥"',
    time: "1h",
    postImage: "https://picsum.photos/100/100?random=61",
    read: false,
  },
  {
    id: "4",
    type: "like",
    user: "Sarnai and 12 others",
    avatar: "https://i.pravatar.cc/150?img=33",
    text: "liked your post.",
    time: "3h",
    postImage: "https://picsum.photos/100/100?random=62",
    read: true,
  },
  {
    id: "5",
    type: "mention",
    user: "Bataa Dorj",
    avatar: "https://i.pravatar.cc/150?img=34",
    text: "mentioned you in a comment.",
    time: "5h",
    postImage: "https://picsum.photos/100/100?random=63",
    read: true,
  },
  {
    id: "6",
    type: "follow",
    user: "Enkhbat Naran",
    avatar: "https://i.pravatar.cc/150?img=35",
    text: "started following you.",
    time: "8h",
    postImage: null,
    read: true,
  },
  {
    id: "7",
    type: "like",
    user: "Oyunaa Ganbold",
    avatar: "https://i.pravatar.cc/150?img=36",
    text: "liked your reel.",
    time: "12h",
    postImage: "https://picsum.photos/100/100?random=64",
    read: true,
  },
  {
    id: "8",
    type: "comment",
    user: "Tulgaa Bat",
    avatar: "https://i.pravatar.cc/150?img=37",
    text: 'commented: "Where is this place?"',
    time: "1d",
    postImage: "https://picsum.photos/100/100?random=65",
    read: true,
  },
  {
    id: "9",
    type: "follow",
    user: "Dulguun Erdene",
    avatar: "https://i.pravatar.cc/150?img=38",
    text: "started following you.",
    time: "2d",
    postImage: null,
    read: true,
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "like":
      return { name: "heart", color: "#ef4444", bg: "#fef2f2" };
    case "comment":
      return { name: "chatbubble", color: "#0ea5e9", bg: "#f0f9ff" };
    case "follow":
      return { name: "person-add", color: "#4f46e5", bg: "#eef2ff" };
    case "mention":
      return { name: "at", color: "#8b5cf6", bg: "#f5f3ff" };
    default:
      return { name: "heart", color: "#4f46e5", bg: "#eef2ff" };
  }
};

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();

  const todayActivities = ACTIVITIES.filter((a) => !a.read);
  const earlierActivities = ACTIVITIES.filter((a) => a.read);

  const renderActivity = (item: (typeof ACTIVITIES)[0]) => {
    const iconInfo = getActivityIcon(item.type);

    return (
      <TouchableOpacity
        key={item.id}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: item.read ? "#ffffff" : "#f9fafb",
        }}
      >
        {/* Avatar with icon badge */}
        <View>
          <Image
            source={{ uri: item.avatar }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: iconInfo.bg,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: item.read ? "#ffffff" : "#f9fafb",
            }}
          >
            <Ionicons
              name={iconInfo.name as any}
              size={10}
              color={iconInfo.color}
            />
          </View>
        </View>

        {/* Text content */}
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#111827",
              lineHeight: 20,
            }}
            numberOfLines={2}
          >
            <Text style={{ fontWeight: "700" }}>{item.user} </Text>
            <Text style={{ fontWeight: "400" }}>{item.text}</Text>
          </Text>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
            {item.time}
          </Text>
        </View>

        {/* Post thumbnail or Follow button */}
        {item.postImage ? (
          <Image
            source={{ uri: item.postImage }}
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              marginLeft: 12,
            }}
          />
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: "#4f46e5",
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 10,
              marginLeft: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
              Follow
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#111827" }}>
          Activity
        </Text>
      </View>

      <FlatList
        data={[
          ...(todayActivities.length > 0
            ? [{ id: "h-today", type: "header", title: "Today" } as any]
            : []),
          ...todayActivities,
          ...(earlierActivities.length > 0
            ? [{ id: "h-earlier", type: "header", title: "Earlier" } as any]
            : []),
          ...earlierActivities,
        ]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {item.title}
                </Text>
              </View>
            );
          }
          return renderActivity(item);
        }}
      />
    </View>
  );
}
