import { ActivityIndicator } from "react-native";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type EditProfileModalProps = {
  visible: boolean;
  bottomInset: number;
  editName: string;
  editBio: string;
  editAvatar: string;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onPickAvatar: () => void;
  onEditNameChange: (value: string) => void;
  onEditBioChange: (value: string) => void;
};

export default function EditProfileModal({
  visible,
  bottomInset,
  editName,
  editBio,
  editAvatar,
  saving,
  onClose,
  onSave,
  onPickAvatar,
  onEditNameChange,
  onEditBioChange,
}: EditProfileModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
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
            paddingBottom: bottomInset + 20,
            paddingHorizontal: 20,
            maxHeight: "85%",
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
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, color: "#6b7280" }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
              Edit Profile
            </Text>
            <TouchableOpacity onPress={onSave} disabled={saving}>
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
            <TouchableOpacity
              onPress={onPickAvatar}
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
              onChangeText={onEditNameChange}
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
              onChangeText={onEditBioChange}
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
                marginBottom: 20,
              }}
            >
              {editBio.length}/160
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
