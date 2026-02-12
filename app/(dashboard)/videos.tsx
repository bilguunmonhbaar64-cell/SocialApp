import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = 12;
const GRID_COLS = 2;
const GRID_ITEM = (SCREEN_WIDTH - 24 * 2 - GRID_GAP) / GRID_COLS;

const CATEGORIES = [
  { id: "all", label: "All", icon: "grid-outline" },
  { id: "travel", label: "Travel", icon: "airplane-outline" },
  { id: "food", label: "Food", icon: "restaurant-outline" },
  { id: "art", label: "Art", icon: "color-palette-outline" },
  { id: "fitness", label: "Fitness", icon: "barbell-outline" },
  { id: "music", label: "Music", icon: "musical-notes-outline" },
];

const EXPLORE_ITEMS = [
  {
    id: "1",
    image: "https://picsum.photos/400/500?random=60",
    likes: "2.4K",
    type: "photo",
  },
  {
    id: "2",
    image: "https://picsum.photos/400/300?random=61",
    likes: "1.1K",
    type: "photo",
  },
  {
    id: "3",
    image: "https://picsum.photos/400/500?random=62",
    likes: "856",
    type: "reel",
    duration: "0:32",
  },
  {
    id: "4",
    image: "https://picsum.photos/400/400?random=63",
    likes: "3.7K",
    type: "photo",
  },
  {
    id: "5",
    image: "https://picsum.photos/400/500?random=64",
    likes: "945",
    type: "reel",
    duration: "1:05",
  },
  {
    id: "6",
    image: "https://picsum.photos/400/300?random=65",
    likes: "2.1K",
    type: "photo",
  },
  {
    id: "7",
    image: "https://picsum.photos/400/400?random=66",
    likes: "678",
    type: "photo",
  },
  {
    id: "8",
    image: "https://picsum.photos/400/500?random=67",
    likes: "4.2K",
    type: "reel",
    duration: "0:45",
  },
];

const TRENDING = [
  {
    id: "t1",
    user: "Travel Mongolia",
    avatar: "https://i.pravatar.cc/150?img=20",
    image: "https://picsum.photos/600/400?random=70",
    caption: "Hidden gems in the Gobi Desert 🏜️",
    likes: "5.6K",
  },
  {
    id: "t2",
    user: "Food UB",
    avatar: "https://i.pravatar.cc/150?img=21",
    image: "https://picsum.photos/600/400?random=71",
    caption: "Best restaurants in Ulaanbaatar 🍜",
    likes: "3.2K",
  },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingTop: insets.top,
          paddingHorizontal: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "bold",
            color: "#111827",
            letterSpacing: -0.5,
            marginBottom: 16,
          }}
        >
          Explore
        </Text>

        {/* Search Bar */}
        <View
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: "#f3f4f6",
          }}
        >
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 10,
              fontSize: 14,
              color: "#111827",
            }}
            placeholder="Search people, tags, places..."
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <FlatList
        data={EXPLORE_ITEMS}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        columnWrapperStyle={{
          paddingHorizontal: 24,
          gap: GRID_GAP,
          marginBottom: GRID_GAP,
        }}
        ListHeaderComponent={() => (
          <>
            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                gap: 10,
                paddingVertical: 16,
              }}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor:
                      activeCategory === cat.id ? "#4f46e5" : "#ffffff",
                    borderWidth: 1,
                    borderColor:
                      activeCategory === cat.id ? "#4f46e5" : "#e5e7eb",
                  }}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={activeCategory === cat.id ? "#fff" : "#6b7280"}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: activeCategory === cat.id ? "#fff" : "#374151",
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Trending Section */}
            <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 14,
                }}
              >
                Trending Now
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 14 }}
              >
                {TRENDING.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      width: SCREEN_WIDTH * 0.7,
                      borderRadius: 20,
                      overflow: "hidden",
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: "#f3f4f6",
                    }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: "100%", height: 180 }}
                      resizeMode="cover"
                    />
                    <View style={{ padding: 14 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <Image
                          source={{ uri: item.avatar }}
                          style={{ width: 24, height: 24, borderRadius: 12 }}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {item.user}
                        </Text>
                      </View>
                      <Text
                        style={{ fontSize: 13, color: "#6b7280" }}
                        numberOfLines={1}
                      >
                        {item.caption}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Grid title */}
            <View
              style={{
                paddingHorizontal: 24,
                marginBottom: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                Discover
              </Text>
              <TouchableOpacity>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#4f46e5",
                    fontWeight: "500",
                  }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{
              width: GRID_ITEM,
              height: index % 3 === 0 ? GRID_ITEM * 1.3 : GRID_ITEM,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#e5e7eb",
            }}
          >
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            {item.type === "reel" && (
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  gap: 4,
                }}
              >
                <Ionicons name="play" size={10} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}
                >
                  {item.duration}
                </Text>
              </View>
            )}
            <View
              style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Ionicons name="heart" size={12} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "bold",
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {item.likes}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
