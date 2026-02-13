import { Text, TouchableOpacity } from "react-native";

type ProfileLogoutButtonProps = {
  onLogout: () => void;
};

export default function ProfileLogoutButton({
  onLogout,
}: ProfileLogoutButtonProps) {
  return (
    <TouchableOpacity
      onPress={onLogout}
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
  );
}
