import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <TouchableOpacity>
          <Ionicons name="close" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
          New Post
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#4f46e5",
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            gap: 12,
          }}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=68" }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              You
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f3f4f6",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                marginTop: 4,
                gap: 4,
              }}
            >
              <Ionicons name="globe-outline" size={12} color="#6b7280" />
              <Text
                style={{ fontSize: 12, color: "#6b7280", fontWeight: "500" }}
              >
                Everyone
              </Text>
              <Ionicons name="chevron-down" size={12} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Caption input */}
        <TextInput
          placeholder="What's inspiring you today?"
          placeholderTextColor="#9ca3af"
          value={caption}
          onChangeText={setCaption}
          multiline
          style={{
            paddingHorizontal: 20,
            fontSize: 18,
            color: "#111827",
            lineHeight: 26,
            minHeight: 120,
            textAlignVertical: "top",
          }}
        />

        {/* Image picker area */}
        {selectedImage ? (
          <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
            <View style={{ borderRadius: 16, overflow: "hidden" }}>
              <Image
                source={{ uri: selectedImage }}
                style={{ width: "100%", height: 300 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() =>
              setSelectedImage("https://picsum.photos/600/400?random=99")
            }
            style={{
              marginHorizontal: 20,
              marginTop: 12,
              height: 200,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: "#e5e7eb",
              borderStyle: "dashed",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f9fafb",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#eef2ff",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="image-outline" size={28} color="#4f46e5" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
              Add Photo or Video
            </Text>
            <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
              Tap to select from your gallery
            </Text>
          </TouchableOpacity>
        )}

        {/* Action buttons */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 2 }}>
          {[
            { icon: "camera-outline", label: "Take a Photo", color: "#4f46e5" },
            {
              icon: "location-outline",
              label: "Add Location",
              color: "#ef4444",
            },
            { icon: "people-outline", label: "Tag People", color: "#0ea5e9" },
            {
              icon: "musical-notes-outline",
              label: "Add Music",
              color: "#8b5cf6",
            },
            {
              icon: "happy-outline",
              label: "Feeling / Activity",
              color: "#f59e0b",
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 4,
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
                style={{ fontSize: 15, fontWeight: "500", color: "#374151" }}
              >
                {item.label}
              </Text>
              <View style={{ flex: 1 }} />
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
