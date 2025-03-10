// /(auth)/_layout.tsx
import React from "react";
import {router, Tabs} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../hooks/useAuth";
import { Platform, TouchableOpacity } from "react-native";
import { useChat } from "@/contexts/ChatContext";

export default function AppLayout() {
  const {user} = useAuth();
  const {unreadCount} = useChat();

  if (!user) {
    return null; 
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#42638f",
        tabBarInactiveTintColor: "#324c6e",
        tabBarStyle: {
          backgroundColor: "rgb(242, 242, 242)",
          borderTopWidth: 1,
          borderTopColor: "#324c6e",
          height: Platform.OS === "android" ? 65 : 85,
          paddingBottom: Platform.OS === "android" ? 10 : 0,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
          color: "#324c6e",
        },
        headerStyle: {
          backgroundColor: "#324c6e",
          height: Platform.OS === "android" ? 55 : 100,
          
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
          marginBottom: 5,
        },
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({color, size}) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({color, size}) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />

      <Tabs.Screen
        name="loads"
        options={{
          title: "Cargas",
          tabBarIcon: ({color, size}) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="person"
        options={{
          title: "Perfil",
          tabBarIcon: ({color, size}) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: "Notificações",
          href: null,
        }}
      />

      <Tabs.Screen
        name="load-details/[id]"
        options={{
          title: "Detalhes da Carga",
          href: null,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push("/(auth)/loads")}>
              <Ionicons
                name="arrow-back"
                size={24}
                color="#FFFFFF"
                style={{marginLeft: 10}}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
