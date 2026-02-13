import { ActivityIndicator } from "react-native";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

type ChangePasswordModalProps = {
  visible: boolean;
  bottomInset: number;
  currentPassword: string;
  newPassword: string;
  changingPassword: boolean;
  onCancel: () => void;
  onSave: () => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
};

export default function ChangePasswordModal({
  visible,
  bottomInset,
  currentPassword,
  newPassword,
  changingPassword,
  onCancel,
  onSave,
  onCurrentPasswordChange,
  onNewPasswordChange,
}: ChangePasswordModalProps) {
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
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ fontSize: 16, color: "#6b7280" }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
              Change Password
            </Text>
            <TouchableOpacity onPress={onSave} disabled={changingPassword}>
              {changingPassword ? (
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
            value={currentPassword}
            onChangeText={onCurrentPasswordChange}
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
            value={newPassword}
            onChangeText={onNewPasswordChange}
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
  );
}
