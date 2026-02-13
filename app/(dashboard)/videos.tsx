import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const REELS = [
  {
    id: "1",
    image: "https://picsum.photos/1080/1920?random=101",
    user: "munkhjin_mn",
    collab: "travelMongolia",
    avatar: "https://i.pravatar.cc/150?img=32",
    caption: "Exploring the hidden valleys of Khentii 🏔️✨",
    music: "Mongolian Breeze · Nomadic Beats",
    likes: "2.7M",
    comments: "6,043",
    reposts: "62.7K",
    shares: "831K",
    saves: "36.5K",
    liked: false,
  },
  {
    id: "2",
    image: "https://picsum.photos/1080/1920?random=102",
    user: "azaa_photo",
    collab: "artUB",
    avatar: "https://i.pravatar.cc/150?img=33",
    caption: "Street photography in UB hits different at night 📸🌃",
    music: "City Lights · Urban Mix",
    likes: "845K",
    comments: "3,211",
    reposts: "28.4K",
    shares: "156K",
    saves: "12.8K",
    liked: true,
  },
  {
    id: "3",
    image: "https://picsum.photos/1080/1920?random=103",
    user: "cooking_mn",
    collab: "foodieUB",
    avatar: "https://i.pravatar.cc/150?img=34",
    caption: "Traditional buuz recipe passed down 3 generations 🥟🔥",
    music: "Home Kitchen · Cozy Vibes",
    likes: "1.2M",
    comments: "8,902",
    reposts: "45.1K",
    shares: "320K",
    saves: "89.2K",
    liked: false,
  },
  {
    id: "4",
    image: "https://picsum.photos/1080/1920?random=104",
    user: "nomad_rider",
    collab: "horselife",
    avatar: "https://i.pravatar.cc/150?img=35",
    caption: "Golden hour on the steppe 🐎🌅",
    music: "Eternal Blue Sky · Morin Khuur",
    likes: "3.1M",
    comments: "12,400",
    reposts: "98.3K",
    shares: "1.2M",
    saves: "67.4K",
    liked: false,
  },
  {
    id: "5",
    image: "https://picsum.photos/1080/1920?random=105",
    user: "tuvshin_fit",
    collab: "gymMN",
    avatar: "https://i.pravatar.cc/150?img=36",
    caption: "Morning workout routine that changed my life 💪🏋️",
    music: "Beast Mode · Workout Beats",
    likes: "567K",
    comments: "2,100",
    reposts: "15.6K",
    shares: "89K",
    saves: "24.1K",
    liked: true,
  },
];

function ActionButton({
  icon,
  label,
  color = "#fff",
  size = 28,
  filled,
}: {
  icon: string;
  label: string;
  color?: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <TouchableOpacity style={{ alignItems: "center", marginBottom: 6 }}>
      <Ionicons name={icon as any} size={size} color={color} />
      <Text
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
          textShadowColor: "rgba(0,0,0,0.5)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ReelItem({
  reel,
  isActive,
}: {
  reel: (typeof REELS)[0];
  isActive: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "#000",
      }}
    >
      {/* Background Image (simulating video) */}
      <Image
        source={{ uri: reel.image }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      />

      {/* Dark gradient overlay at bottom */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 350,
        }}
      />

      {/* Right side action buttons */}
      <View
        style={{
          position: "absolute",
          right: 12,
          bottom: 160,
          alignItems: "center",
          gap: 14,
        }}
      >
        <ActionButton
          icon={reel.liked ? "heart" : "heart-outline"}
          label={reel.likes}
          color={reel.liked ? "#ef4444" : "#fff"}
        />
        <ActionButton icon="chatbubble-outline" label={reel.comments} />
        <ActionButton icon="repeat-outline" label={reel.reposts} size={26} />
        <ActionButton icon="paper-plane-outline" label={reel.shares} />
        <ActionButton icon="bookmark-outline" label={reel.saves} />

        {/* Album art thumbnail */}
        <TouchableOpacity style={{ marginTop: 6 }}>
          <Image
            source={{ uri: reel.avatar }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: "#fff",
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom info */}
      <View
        style={{
          position: "absolute",
          bottom: 100,
          left: 14,
          right: 70,
        }}
      >
        {/* Username + Follow */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Image
            source={{ uri: reel.avatar }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: "#fff",
              marginRight: 10,
            }}
          />
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: "700",
              textShadowColor: "rgba(0,0,0,0.6)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {reel.user}
          </Text>
          {reel.collab && (
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: "400",
                textShadowColor: "rgba(0,0,0,0.6)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              {" "}and{" "}
              <Text style={{ fontWeight: "700" }}>{reel.collab}</Text>
            </Text>
          )}
          <TouchableOpacity
            style={{
              marginLeft: 12,
              borderWidth: 1.5,
              borderColor: "#fff",
              borderRadius: 8,
              paddingHorizontal: 14,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              Follow
            </Text>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <Text
          style={{
            color: "#fff",
            fontSize: 13.5,
            fontWeight: "500",
            lineHeight: 19,
            textShadowColor: "rgba(0,0,0,0.6)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
            marginBottom: 10,
          }}
          numberOfLines={2}
        >
          {reel.caption}
        </Text>

        {/* Music */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="musical-note" size={13} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontSize: 12.5,
              fontWeight: "500",
              textShadowColor: "rgba(0,0,0,0.6)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
            numberOfLines={1}
          >
            {reel.music}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"reels" | "friends">("reels");
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen Reels FlatList */}
      <FlatList
        data={REELS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ReelItem reel={item} isActive={index === activeIndex} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {/* Top Header Overlay */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left: Create */}
        <TouchableOpacity>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Center: Tabs */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <TouchableOpacity onPress={() => setActiveTab("reels")}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: activeTab === "reels" ? "800" : "600",
                color: "#fff",
                opacity: activeTab === "reels" ? 1 : 0.6,
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              Reels
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("friends")}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: activeTab === "friends" ? "800" : "600",
                color: "#fff",
                opacity: activeTab === "friends" ? 1 : 0.6,
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              Friends 🍻🍻
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right: Settings */}
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
