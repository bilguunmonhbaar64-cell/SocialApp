import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  LayoutChangeEvent,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  deleteReel,
  fetchReels,
  toggleReelLike,
  toggleReelSave,
  updateReel,
  viewReel,
  type Reel,
  type ReelTab,
  type ReelVisibility,
} from "../../services/api";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const nextVisibilityValue = (visibility: ReelVisibility): ReelVisibility => {
  if (visibility === "public") return "followers";
  if (visibility === "followers") return "private";
  return "public";
};

const formatCount = (count: number): string => {
  if (!Number.isFinite(count)) return "0";
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
};

function ActionButton({
  icon,
  label,
  color = "#fff",
  size = 28,
  onPress,
}: {
  icon: string;
  label: string;
  color?: string;
  size?: number;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={{ alignItems: "center", marginBottom: 6 }}
      onPress={onPress}
      activeOpacity={0.75}
    >
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
  itemHeight,
  screenFocused,
  onToggleLike,
  onToggleSave,
}: {
  reel: Reel;
  isActive: boolean;
  itemHeight: number;
  screenFocused: boolean;
  onToggleLike: (reelId: string) => void;
  onToggleSave: (reelId: string) => void;
}) {
  const bottomInfoOffset = Platform.OS === "ios" ? 4 : 2;
  const actionsBottomOffset = bottomInfoOffset + 56;
  const coverImage = reel.thumbUrl || "";
  const avatarUri =
    reel.author.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.author.name)}`;

  const videoRef = useRef<Video>(null);
  const [paused, setPaused] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const hasVideo = !!reel.playbackUrl;

  // Auto-play/pause based on whether reel is active AND screen is focused
  useEffect(() => {
    if (!hasVideo || !videoRef.current) return;
    if (isActive && !paused && screenFocused) {
      videoRef.current.playAsync().catch(() => {});
    } else {
      videoRef.current.pauseAsync().catch(() => {});
    }
  }, [isActive, paused, hasVideo, screenFocused]);

  // Reset pause state when reel becomes active
  useEffect(() => {
    if (isActive) setPaused(false);
  }, [isActive]);

  const togglePause = () => {
    if (!hasVideo) return;
    setPaused((prev) => !prev);
  };

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: itemHeight,
        backgroundColor: "#000",
      }}
    >
      {/* Video or thumbnail */}
      {hasVideo && !videoError ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={togglePause}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Video
            ref={videoRef}
            source={{ uri: reel.playbackUrl }}
            style={{
              width: "100%",
              height: "100%",
              transform: [{ scaleX: 1.15 }, { scaleY: 1.05 }],
            }}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={isActive && !paused && screenFocused}
            isMuted={false}
            posterSource={coverImage ? { uri: coverImage } : undefined}
            usePoster={!!coverImage}
            onLoad={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
          />
          {/* Pause indicator */}
          {paused && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="play" size={34} color="#fff" />
              </View>
            </View>
          )}
          {/* Loading spinner while video loads */}
          {!videoLoaded && isActive && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      ) : coverImage ? (
        <Image
          source={{ uri: coverImage }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
          resizeMode="contain"
        />
      ) : (
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#0b1120",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="film-outline" size={54} color="rgba(255,255,255,0.22)" />
        </View>
      )}

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.75)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 300,
        }}
      />

      <View
        style={{
          position: "absolute",
          right: 12,
          bottom: actionsBottomOffset,
          alignItems: "center",
          gap: 14,
        }}
      >
        <ActionButton
          icon={reel.likedByMe ? "heart" : "heart-outline"}
          label={formatCount(reel.likesCount)}
          color={reel.likedByMe ? "#ef4444" : "#fff"}
          onPress={() => onToggleLike(reel.id)}
        />
        <ActionButton
          icon="chatbubble-outline"
          label={formatCount(reel.commentsCount)}
        />
        <ActionButton
          icon="repeat-outline"
          label={formatCount(reel.repostsCount)}
          size={26}
        />
        <ActionButton
          icon="paper-plane-outline"
          label={formatCount(reel.sharesCount)}
        />
        <ActionButton
          icon={reel.savedByMe ? "bookmark" : "bookmark-outline"}
          label={formatCount(reel.savesCount)}
          onPress={() => onToggleSave(reel.id)}
        />
      </View>

      <View
        style={{
          position: "absolute",
          bottom: bottomInfoOffset,
          left: 14,
          right: 70,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Image
            source={{ uri: avatarUri }}
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
              flex: 1,
            }}
            numberOfLines={1}
          >
            {reel.author.name}
          </Text>
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
          {reel.caption || "No caption"}
        </Text>

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
            {reel.music || "Original audio"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ReelsFeedScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState<ReelTab>("reels");
  const [activeIndex, setActiveIndex] = useState(0);
  const [listHeight, setListHeight] = useState(SCREEN_HEIGHT);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  const viewedReelIds = useRef<Set<string>>(new Set());
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const onListLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const nextHeight = nativeEvent.layout.height;
    if (Math.abs(nextHeight - listHeight) > 1) {
      setListHeight(nextHeight);
    }
  };

  const loadReels = useCallback(
    async () => {
      setLoading(true);
      const first = await fetchReels(activeTab);
      if (first.error) {
        setReels([]);
        setLoading(false);
        Alert.alert("Reels", first.error);
        return;
      }

      const next = first.data || [];
      setReels(next);
      setActiveIndex((prev) =>
        next.length ? Math.min(prev, next.length - 1) : 0,
      );
      setLoading(false);
    },
    [activeTab],
  );

  useEffect(() => {
    viewedReelIds.current.clear();
    loadReels();
  }, [loadReels]);

  useEffect(() => {
    const current = reels[activeIndex];
    if (!current || viewedReelIds.current.has(current.id)) return;
    viewedReelIds.current.add(current.id);
    viewReel(current.id).then((result) => {
      if (!result.data) return;
      setReels((prev) =>
        prev.map((reel) =>
          reel.id === current.id
            ? { ...reel, viewsCount: result.data?.viewsCount ?? reel.viewsCount }
            : reel,
        ),
      );
    });
  }, [activeIndex, reels]);

  const handleToggleLike = async (reelId: string) => {
    const result = await toggleReelLike(reelId);
    if (!result.data) return;
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              likedByMe: result.data!.liked,
              likesCount: result.data!.likeCount,
            }
          : reel,
      ),
    );
  };

  const handleToggleSave = async (reelId: string) => {
    const result = await toggleReelSave(reelId);
    if (!result.data) return;
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              savedByMe: result.data!.saved,
              savesCount: result.data!.savesCount,
            }
          : reel,
      ),
    );
  };

  const openManageMenu = () => {
    const current = reels[activeIndex];
    if (!current) {
      Alert.alert("Manage Reels", "No reel selected.", [{ text: "Close", style: "cancel" }]);
      return;
    }

    const ownActions = current.ownedByMe
      ? [
          {
            text: `Visibility: ${current.visibility}`,
            onPress: async () => {
              const next = nextVisibilityValue(current.visibility);
              const result = await updateReel(current.id, { visibility: next });
              if (!result.data) {
                Alert.alert("Manage Reels", result.error || "Failed to update visibility");
                return;
              }
              setReels((prev) =>
                prev.map((reel) =>
                  reel.id === current.id ? { ...reel, visibility: next } : reel,
                ),
              );
            },
          },
          {
            text: "Delete This Reel",
            style: "destructive" as const,
            onPress: async () => {
              const result = await deleteReel(current.id);
              if (!result.data) {
                Alert.alert("Manage Reels", result.error || "Failed to delete reel");
                return;
              }
              setReels((prev) => prev.filter((reel) => reel.id !== current.id));
            },
          },
        ]
      : [];

    Alert.alert("Manage Reels", "Choose an action", [
      { text: "Refresh Feed", onPress: () => void loadReels() },
      ...ownActions,
      { text: "Close", style: "cancel" },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ marginTop: 10, color: "#d1d5db", fontSize: 13 }}>
            Loading reels...
          </Text>
        </View>
      ) : (
        <FlatList
          data={reels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReelItem
              reel={item}
              isActive={item.id === reels[activeIndex]?.id}
              itemHeight={listHeight}
              screenFocused={isFocused}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={listHeight}
          decelerationRate="fast"
          onLayout={onListLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: listHeight,
            offset: listHeight * index,
            index,
          })}
          ListEmptyComponent={
            <View style={{ height: listHeight, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="videocam-outline" size={48} color="#d1d5db" />
              <Text style={{ marginTop: 10, color: "#fff", fontWeight: "700" }}>
                No reels yet
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  color: "#9ca3af",
                  fontSize: 13,
                  textAlign: "center",
                  paddingHorizontal: 28,
                }}
              >
                Tap + on Home header to create a post, story, or reel.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(dashboard)")}
                style={{
                  marginTop: 14,
                  backgroundColor: "#111827",
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Go to Home (+)</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

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
        <View style={{ width: 28 }} />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <TouchableOpacity onPress={() => setActiveTab("reels")}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: activeTab === "reels" ? "800" : "600",
                color: "#fff",
                opacity: activeTab === "reels" ? 1 : 0.6,
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
              }}
            >
              Friends
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={openManageMenu}>
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
