// components/ChatButton.jsx
import React from "react";
import {TouchableOpacity, StyleSheet, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import { useChat } from "@/contexts/ChatContext";

import { StyleProp, ViewStyle } from "react-native";

const ChatButton = ({chatId = "general", style}: { chatId?: string; style?: StyleProp<ViewStyle> }) => {
  const {showChat, unreadCount} = useChat();

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => showChat(chatId)}
    >
      <Ionicons name="chatbubble-ellipses" size={24} color="#324c6e" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF5252",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default ChatButton;
