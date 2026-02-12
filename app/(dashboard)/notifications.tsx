import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NOTIFICATIONS = [
  {
    id: "1",
    avatar: "https://i.pravatar.cc/150?img=40",
    title: "New update available",
    text: "Connect v2.1 is here with dark mode and new features.",
    time: "Just now",
    read: false,
    icon: "sparkles",
    iconColor: "#4f46e5",
    iconBg: "#eef2ff",
  },
  {
    id: "2",
    avatar: "https://i.pravatar.cc/150?img=41",
    title: "Munkhjin shared a story",
    text: "Check out their new travel photos from Khuvsgul.",
    time: "5m ago",
    read: false,
    icon: "images",
    iconColor: "#0ea5e9",
    iconBg: "#f0f9ff",
  },
  {
    id: "3",
    avatar: "https://i.pravatar.cc/150?img=42",
    title: "Your post is trending",
    text: "Your sunset photo reached 500+ likes!",
    time: "30m ago",
    read: false,
    icon: "trending-up",
    iconColor: "#f59e0b",
    iconBg: "#fffbeb",
  },
  {
    id: "4",
    avatar: "https://i.pravatar.cc/150?img=43",
    title: "Azaa sent you a message",
    text: '"Hey, are you free this weekend?"',
    time: "1h ago",
    read: true,
    icon: "chatbubble",
    iconColor: "#10b981",
    iconBg: "#ecfdf5",
  },
  {
    id: "5",
    avatar: "https://i.pravatar.cc/150?img=44",
    title: "Weekly summary",
    text: "You gained 24 new followers this week. Keep it up!",
    time: "3h ago",
    read: true,
    icon: "bar-chart",
    iconColor: "#8b5cf6",
    iconBg: "#f5f3ff",
  },
  {
    id: "6",
    avatar: "https://i.pravatar.cc/150?img=45",
    title: "Tuvshin mentioned you",
    text: 'Tagged you in a comment: "Look at this @you"',
    time: "5h ago",
    read: true,
    icon: "at",
    iconColor: "#4f46e5",
    iconBg: "#eef2ff",
  },
  {
    id: "7",
    avatar: "https://i.pravatar.cc/150?img=46",
    title: "Live event starting",
    text: "Photography Masterclass starts in 15 minutes.",
    time: "8h ago",
    read: true,
    icon: "videocam",
    iconColor: "#ef4444",
    iconBg: "#fef2f2",
  },
  {
    id: "8",
    avatar: "https://i.pravatar.cc/150?img=47",
    title: "New follower request",
    text: "Sarnai Tsetseg wants to follow you.",
    time: "1d ago",
    read: true,
    icon: "person-add",
    iconColor: "#4f46e5",
    iconBg: "#eef2ff",
  },
];

function NotificationCard({
  notification,
}: {
  notification: (typeof NOTIFICATIONS)[0];
}) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        backgroundColor: notification.read ? "#ffffff" : "#f9fafb",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: notification.read ? "#f3f4f6" : "#e5e7eb",
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: notification.iconBg,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 14,
        }}
      >
        <Ionicons
          name={notification.icon as any}
          size={20}
          color={notification.iconColor}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: "#111827",
              flex: 1,
              marginRight: 8,
            }}
          >
            {notification.title}
          </Text>
          {!notification.read && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#4f46e5",
                marginTop: 6,
              }}
            />
          )}
        </View>
        <Text
          style={{
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 18,
            marginTop: 3,
          }}
          numberOfLines={2}
        >
          {notification.text}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
          {notification.time}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const unreadNotifications = NOTIFICATIONS.filter((n) => !n.read);
  const readNotifications = NOTIFICATIONS.filter((n) => n.read);

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
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#111827" }}>
          Notifications
        </Text>
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
          <Ionicons name="settings-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[
          ...(unreadNotifications.length > 0
            ? [{ id: "h-new", type: "header", title: "New" } as any]
            : []),
          ...unreadNotifications,
          ...(readNotifications.length > 0
            ? [{ id: "h-earlier", type: "header", title: "Earlier" } as any]
            : []),
          ...readNotifications,
        ]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 12,
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
                {item.title === "New" && (
                  <TouchableOpacity>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#4f46e5",
                        fontWeight: "600",
                      }}
                    >
                      Mark all as read
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }
          return <NotificationCard notification={item} />;
        }}
      />
    </View>
  );
}
