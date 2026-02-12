import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SIZE = (SCREEN_WIDTH - 44) / 3;

const POSTS_GRID = [
  { id: "1", image: "https://picsum.photos/400/400?random=70" },
  { id: "2", image: "https://picsum.photos/400/400?random=71" },
  { id: "3", image: "https://picsum.photos/400/400?random=72" },
  { id: "4", image: "https://picsum.photos/400/400?random=73" },
  { id: "5", image: "https://picsum.photos/400/400?random=74" },
  { id: "6", image: "https://picsum.photos/400/400?random=75" },
  { id: "7", image: "https://picsum.photos/400/400?random=76" },
  { id: "8", image: "https://picsum.photos/400/400?random=77" },
  { id: "9", image: "https://picsum.photos/400/400?random=78" },
];

const SETTINGS_ITEMS = [
  { icon: "person-outline", label: "Edit Profile", color: "#4f46e5" },
  { icon: "bookmark-outline", label: "Saved Posts", color: "#0ea5e9" },
  { icon: "shield-checkmark-outline", label: "Privacy", color: "#10b981" },
  {
    icon: "notifications-outline",
    label: "Notification Settings",
    color: "#f59e0b",
  },
  { icon: "help-circle-outline", label: "Help & Support", color: "#6b7280" },
  { icon: "information-circle-outline", label: "About", color: "#6b7280" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    router.replace("/(tabs)");
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
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#111827" }}>
          Profile
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile info */}
        <View
          style={{ alignItems: "center", paddingTop: 28, paddingBottom: 20 }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 3,
              borderColor: "#4f46e5",
              padding: 3,
            }}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=68" }}
              style={{ width: "100%", height: "100%", borderRadius: 44 }}
            />
          </View>

          {/* Name & username */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#111827",
              marginTop: 14,
            }}
          >
            Connect User
          </Text>
          <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 2 }}>
            @connectuser
          </Text>

          {/* Bio */}
          <Text
            style={{
              fontSize: 14,
              color: "#6b7280",
              textAlign: "center",
              marginTop: 10,
              paddingHorizontal: 40,
              lineHeight: 20,
            }}
          >
            Exploring the world one photo at a time ✨{"\n"}Based in Ulaanbaatar
          </Text>

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              gap: 32,
            }}
          >
            {[
              { label: "Posts", value: "128" },
              { label: "Followers", value: "2.4K" },
              { label: "Following", value: "586" },
            ].map((stat) => (
              <TouchableOpacity
                key={stat.label}
                style={{ alignItems: "center" }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#111827",
                  }}
                >
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 20,
              paddingHorizontal: 20,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#4f46e5",
                paddingVertical: 11,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#f3f4f6",
                paddingVertical: 11,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#374151", fontWeight: "700", fontSize: 14 }}
              >
                Share Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts Grid */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
            paddingTop: 4,
          }}
        >
          {/* Grid/List toggle */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 40,
              paddingVertical: 12,
            }}
          >
            <TouchableOpacity>
              <Ionicons name="grid-outline" size={22} color="#4f46e5" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="bookmark-outline" size={22} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={22} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Photo grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 20,
              gap: 2,
            }}
          >
            {POSTS_GRID.map((post) => (
              <TouchableOpacity key={post.id}>
                <Image
                  source={{ uri: post.image }}
                  style={{
                    width: GRID_SIZE,
                    height: GRID_SIZE,
                    borderRadius: 4,
                    backgroundColor: "#f3f4f6",
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings section */}
        <View
          style={{
            marginTop: 24,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
            paddingTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Settings
          </Text>
          {SETTINGS_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                gap: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#f3f4f6",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: item.color + "15",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.color}
                />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginHorizontal: 20,
            marginTop: 24,
            marginBottom: 40,
            paddingVertical: 14,
            borderRadius: 14,
            backgroundColor: "#fef2f2",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#fecaca",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#ef4444" }}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
