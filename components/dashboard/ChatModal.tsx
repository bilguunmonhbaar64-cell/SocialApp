import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  sendMessage as apiSendMessage,
  getMessages,
  type ChatMessage,
} from "../../services/api";

export default function ChatModal({
  visible,
  userId,
  userName,
  userAvatar,
  currentUserId,
  onClose,
}: {
  visible: boolean;
  userId: string | null;
  userName: string;
  userAvatar: string;
  currentUserId: string | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!visible || !userId) return;
    setLoading(true);
    setMessages([]);
    (async () => {
      const res = await getMessages(userId);
      if (res.data) {
        setMessages(res.data.messages);
      }
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    })();
  }, [visible, userId]);

  // Poll for new messages every 4 seconds
  useEffect(() => {
    if (!visible || !userId) return;
    const interval = setInterval(async () => {
      const res = await getMessages(userId);
      if (res.data) {
        setMessages(res.data.messages);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [visible, userId]);

  const handleSend = async () => {
    if (!text.trim() || !userId || sending) return;
    const msgText = text.trim();
    setText("");
    setSending(true);

    const res = await apiSendMessage(userId, msgText);
    if (res.data) {
      setMessages((prev) => [...prev, res.data!]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else if (res.error) {
      Alert.alert("Error", res.error);
      setText(msgText);
    }
    setSending(false);
  };

  const formatMsgTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const time = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffDays === 0) return time;
    if (diffDays === 1) return `Yesterday ${time}`;
    if (diffDays < 7)
      return `${d.toLocaleDateString([], { weekday: "short" })} ${time}`;
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
  };

  const handleCopyMessage = (text: string) => {
    Alert.alert("Message", text, [
      {
        text: "Copy",
        onPress: () => {
          Clipboard.setStringAsync(text);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          maxWidth: "78%",
          marginVertical: 3,
          marginHorizontal: 12,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onLongPress={() => handleCopyMessage(item.text)}
          style={{
            backgroundColor: isMe ? "#4f46e5" : "#f3f4f6",
            borderRadius: 18,
            borderBottomRightRadius: isMe ? 4 : 18,
            borderBottomLeftRadius: isMe ? 18 : 4,
            paddingHorizontal: 14,
            paddingVertical: 9,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: isMe ? "#fff" : "#111827",
              lineHeight: 20,
            }}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 10,
            color: "#9ca3af",
            marginTop: 3,
            alignSelf: isMe ? "flex-end" : "flex-start",
            marginHorizontal: 4,
          }}
        >
          {formatMsgTime(item.createdAt)}
          {isMe && item.read ? "  ✓✓" : ""}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Chat header */}
        <View
          style={{
            paddingTop: insets.top + 6,
            paddingHorizontal: 14,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
            backgroundColor: "#fff",
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#f3f4f6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>

          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          ) : (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#e0e7ff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#4f46e5" }}
              >
                {userName?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {userName}
            </Text>
          </View>
        </View>

        {/* Messages list */}
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingVertical: 12,
              flexGrow: 1,
              justifyContent: messages.length === 0 ? "center" : "flex-end",
            }}
            ListEmptyComponent={
              <View style={{ alignItems: "center", padding: 40 }}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={56}
                  color="#e5e7eb"
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#9ca3af",
                    marginTop: 12,
                  }}
                >
                  No messages yet
                </Text>
                <Text style={{ fontSize: 13, color: "#d1d5db", marginTop: 4 }}>
                  Say hello to {userName}!
                </Text>
              </View>
            }
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: insets.bottom + 8,
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
            backgroundColor: "#fff",
            gap: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#f3f4f6",
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              maxHeight: 120,
            }}
          >
            <TextInput
              style={{
                fontSize: 15,
                color: "#111827",
                maxHeight: 100,
              }}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={text}
              onChangeText={setText}
              multiline
              returnKeyType="default"
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: text.trim() && !sending ? "#4f46e5" : "#e5e7eb",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 1,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
