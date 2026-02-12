import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === "ios" ? 14 : 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          height: 58 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Create",
          tabBarItemStyle: {
            position: "absolute",
            left: "50%",
            transform: [{ translateX: -28 }],
            top: -10,
            width: 56,
            height: 56,
            flex: 0,
          },
          tabBarIcon: () => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: "#4f46e5",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#4f46e5",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.28,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <Ionicons name="add" size={28} color="#ffffff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
