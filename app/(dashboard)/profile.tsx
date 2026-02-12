import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  changePassword,
  clearAuth,
  deleteAccount,
  fetchPosts,
  getMe,
  updateProfile,
  type Post,
  type UserProfile,
} from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SIZE = (SCREEN_WIDTH - 44) / 3;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit profile modal
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  // Change password modal
  const [pwVisible, setPwVisible] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const loadData = async () => {
    const [profileRes, postsRes] = await Promise.all([getMe(), fetchPosts()]);
    if (profileRes.data) {
      setProfile(profileRes.data);
    }
    if (postsRes.data && profileRes.data) {
      const mine = postsRes.data.filter(
        (p) => p.author.id === profileRes.data!.id,
      );
      setMyPosts(mine);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    await clearAuth();
    router.replace("/(tabs)");
  };

  const openEditProfile = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditBio(profile.bio || "");
    setEditAvatar(profile.avatarUrl || "");
    setEditVisible(true);
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      const mime = result.assets[0].mimeType || "image/jpeg";
      setEditAvatar(`data:${mime};base64,${result.assets[0].base64}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setSaving(true);
    const { data, error } = await updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      avatarUrl: editAvatar || undefined,
    });
    setSaving(false);
    if (error) {
      Alert.alert("Error", error);
      return;
    }
    if (data) setProfile(data);
    setEditVisible(false);
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      Alert.alert("Error", "Please fill in both fields");
      return;
    }
    if (newPw.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }
    setChangingPw(true);
    const { error } = await changePassword(currentPw, newPw);
    setChangingPw(false);
    if (error) {
      Alert.alert("Error", error);
      return;
    }
    Alert.alert("Success", "Password updated!");
    setPwVisible(false);
    setCurrentPw("");
    setNewPw("");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all posts. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) {
              Alert.alert("Error", error);
              return;
            }
            router.replace("/(tabs)");
          },
        },
      ],
    );
  };

  const avatarUri =
    profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "U")}&background=4f46e5&color=fff&size=200`;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 20,
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
            tintColor="#4f46e5"
          />
        }
      >
        {/* Profile info */}
        <View
          style={{ alignItems: "center", paddingTop: 28, paddingBottom: 20 }}
        >
          {/* Avatar */}
          <TouchableOpacity onPress={openEditProfile}>
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
                source={{ uri: avatarUri }}
                style={{ width: "100%", height: "100%", borderRadius: 44 }}
              />
            </View>
          </TouchableOpacity>

          {/* Name & email */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#111827",
              marginTop: 14,
            }}
          >
            {profile?.name || "User"}
          </Text>
          <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 2 }}>
            {profile?.email || ""}
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
            {profile?.bio || "Tap Edit Profile to add a bio ✨"}
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
              { label: "Posts", value: String(myPosts.length) },
              { label: "Followers", value: "0" },
              { label: "Following", value: "0" },
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
              onPress={openEditProfile}
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

          {myPosts.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: 20,
                gap: 2,
              }}
            >
              {myPosts.map((post) => (
                <TouchableOpacity key={post.id}>
                  {post.imageUrl ? (
                    <Image
                      source={{ uri: post.imageUrl }}
                      style={{
                        width: GRID_SIZE,
                        height: GRID_SIZE,
                        borderRadius: 4,
                        backgroundColor: "#f3f4f6",
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: GRID_SIZE,
                        height: GRID_SIZE,
                        borderRadius: 4,
                        backgroundColor: "#eef2ff",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#4f46e5",
                          textAlign: "center",
                        }}
                        numberOfLines={4}
                      >
                        {post.text}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: "center", padding: 40 }}>
              <Ionicons name="camera-outline" size={48} color="#d1d5db" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#9ca3af",
                  marginTop: 12,
                }}
              >
                No posts yet
              </Text>
              <Text style={{ fontSize: 13, color: "#d1d5db", marginTop: 4 }}>
                Share your first post!
              </Text>
            </View>
          )}
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
          {[
            {
              icon: "person-outline",
              label: "Edit Profile",
              color: "#4f46e5",
              onPress: openEditProfile,
            },
            {
              icon: "lock-closed-outline",
              label: "Change Password",
              color: "#10b981",
              onPress: () => setPwVisible(true),
            },
            {
              icon: "bookmark-outline",
              label: "Saved Posts",
              color: "#0ea5e9",
              onPress: () => {},
            },
            {
              icon: "shield-checkmark-outline",
              label: "Privacy",
              color: "#10b981",
              onPress: () => {},
            },
            {
              icon: "notifications-outline",
              label: "Notification Settings",
              color: "#f59e0b",
              onPress: () => {},
            },
            {
              icon: "help-circle-outline",
              label: "Help & Support",
              color: "#6b7280",
              onPress: () => {},
            },
            {
              icon: "trash-outline",
              label: "Delete Account",
              color: "#ef4444",
              onPress: handleDeleteAccount,
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
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
                  color: item.color === "#ef4444" ? "#ef4444" : "#374151",
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

      {/* ── Edit Profile Modal ────────────────────────────────────── */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 16,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 20,
              maxHeight: "85%",
            }}
          >
            {/* Modal header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Text style={{ fontSize: 16, color: "#6b7280" }}>Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
              >
                Edit Profile
              </Text>
              <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#4f46e5" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#4f46e5",
                    }}
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Avatar picker */}
              <TouchableOpacity
                onPress={pickAvatar}
                style={{ alignItems: "center", marginBottom: 24 }}
              >
                <Image
                  source={{
                    uri:
                      editAvatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(editName || "U")}&background=4f46e5&color=fff&size=200`,
                  }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#f3f4f6",
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#4f46e5",
                    marginTop: 8,
                  }}
                >
                  Change Photo
                </Text>
              </TouchableOpacity>

              {/* Name */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#f3f4f6",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: "#111827",
                  marginBottom: 16,
                }}
                placeholder="Your name"
                placeholderTextColor="#9ca3af"
              />

              {/* Bio */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Bio
              </Text>
              <TextInput
                value={editBio}
                onChangeText={setEditBio}
                multiline
                maxLength={160}
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#f3f4f6",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: "#111827",
                  minHeight: 80,
                  textAlignVertical: "top",
                  marginBottom: 8,
                }}
                placeholder="Write a short bio..."
                placeholderTextColor="#9ca3af"
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  textAlign: "right",
                  marginBottom: 16,
                }}
              >
                {editBio.length}/160
              </Text>

              {/* Avatar URL */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Profile Picture URL (optional)
              </Text>
              <TextInput
                value={editAvatar}
                onChangeText={setEditAvatar}
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#f3f4f6",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: "#111827",
                  marginBottom: 20,
                }}
                placeholder="https://example.com/photo.jpg"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                keyboardType="url"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Change Password Modal ─────────────────────────────────── */}
      <Modal visible={pwVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 16,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setPwVisible(false);
                  setCurrentPw("");
                  setNewPw("");
                }}
              >
                <Text style={{ fontSize: 16, color: "#6b7280" }}>Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
              >
                Change Password
              </Text>
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={changingPw}
              >
                {changingPw ? (
                  <ActivityIndicator size="small" color="#4f46e5" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#4f46e5",
                    }}
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: 6,
              }}
            >
              Current Password
            </Text>
            <TextInput
              value={currentPw}
              onChangeText={setCurrentPw}
              secureTextEntry
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#f3f4f6",
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: "#111827",
                marginBottom: 16,
              }}
              placeholder="Enter current password"
              placeholderTextColor="#9ca3af"
            />

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: 6,
              }}
            >
              New Password
            </Text>
            <TextInput
              value={newPw}
              onChangeText={setNewPw}
              secureTextEntry
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#f3f4f6",
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: "#111827",
                marginBottom: 8,
              }}
              placeholder="Min 8 characters"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
