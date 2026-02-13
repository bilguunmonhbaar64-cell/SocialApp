import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  deleteStory as apiDeleteStory,
  viewStory as apiViewStory,
  type StoryGroup,
} from "../../services/api";
import { timeAgo } from "./helpers";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function StoryViewerModal({
  visible,
  storyGroup,
  onClose,
  currentUserId,
  onDeleted,
}: {
  visible: boolean;
  storyGroup: StoryGroup | null;
  onClose: () => void;
  currentUserId: string | null;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const isOwnStory = storyGroup?.user.id === currentUserId;
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const stories = storyGroup?.stories || [];
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (visible) setCurrentIndex(0);
  }, [visible, storyGroup]);

  useEffect(() => {
    if (!visible || !currentStory) return;

    // Mark as viewed
    if (currentUserId && currentStory.id) {
      apiViewStory(currentStory.id);
    }

    // Progress bar animation (5 seconds per story)
    progressAnim.setValue(0);
    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          onClose();
        }
      }
    });

    return () => anim.stop();
  }, [visible, currentIndex, currentStory]);

  if (!storyGroup || !currentStory) return null;

  const handleTap = (side: "left" | "right") => {
    if (side === "right") {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onClose();
      }
    } else {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* Story image */}
        <Image
          source={{ uri: currentStory.imageUrl }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          resizeMode="cover"
        />

        {/* Overlay top */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            paddingTop: 50,
            paddingHorizontal: 12,
          }}
        >
          {/* Progress bars */}
          <View style={{ flexDirection: "row", gap: 4, marginBottom: 12 }}>
            {stories.map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 2.5,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                {i < currentIndex ? (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#fff",
                    }}
                  />
                ) : i === currentIndex ? (
                  <Animated.View
                    style={{
                      height: "100%",
                      backgroundColor: "#fff",
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>

          {/* User info + close */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Image
                source={{
                  uri:
                    storyGroup.user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(storyGroup.user.name)}&background=4f46e5&color=fff`,
                }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 15,
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {storyGroup.user.name}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {timeAgo(currentStory.createdAt)}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {isOwnStory && (
                <TouchableOpacity
                  onPress={() => {
                    const story = stories[currentIndex];
                    if (!story) return;
                    Alert.alert("Delete Story", "Remove this story?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          setDeleting(true);
                          await apiDeleteStory(story.id);
                          setDeleting(false);
                          onClose();
                          onDeleted();
                        },
                      },
                    ]);
                  }}
                  disabled={deleting}
                >
                  <Ionicons name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Caption at bottom */}
        {currentStory.caption ? (
          <View
            style={{
              position: "absolute",
              bottom: 60,
              left: 16,
              right: 16,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                textAlign: "center",
                textShadowColor: "rgba(0,0,0,0.6)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {currentStory.caption}
            </Text>
          </View>
        ) : null}

        {/* Tap zones */}
        <View
          style={{
            position: "absolute",
            top: 100,
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => handleTap("left")}
          />
          <TouchableOpacity
            style={{ flex: 2 }}
            activeOpacity={1}
            onPress={() => handleTap("right")}
          />
        </View>
      </View>
    </Modal>
  );
}
