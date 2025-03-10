import React, {useRef, useState} from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Modal,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import LogoSvg from "../assets/Billor-logo.svg";
import Svg from "react-native-svg";
import AvatarDropdown from "@/components/AvatarDropdown";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {router} from "expo-router";
import {useAuth} from "@/hooks/useAuth";
import {Notification, useNotification} from "@/contexts/NotificationContext";
import {Ionicons} from "@expo/vector-icons";

export default function Header() {
  const {user, logout} = useAuth();
  const {notifications, unreadCount, markAsRead, deleteNotification} =
    useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotifications = () => {
    setShowNotifications(false);
    router.push("/(auth)/notification");
  };

  const toggleNotificationDropdown = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.loadId) {
      router.push({
        pathname: `/(auth)/notification`,
      });
    }

    setShowNotifications(false);
  };

  const renderNotificationItem = ({item}: {item: Notification}) => (
    <Pressable
      style={[styles.notificationItem, item.read && styles.notificationRead]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          deleteNotification(item.id);
        }}
      >
        <Ionicons name="trash-outline" size={16} color="#f44336" />
      </TouchableOpacity>
    </Pressable>
  );

  // Definindo posição do dropdown baseado na plataforma
  const dropdownPosition = {
    top: Platform.OS === "android" ? 105 : 140,
    right: Platform.OS === "android" ? 60 : 60,
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <Svg width="50" height="50">
          <LogoSvg width={50} height={50} />
        </Svg>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={toggleNotificationDropdown}
          >
            <MaterialIcons name="notifications" size={24} color="#324c6e" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <AvatarDropdown user={user} logout={logout} />
        </View>
      </View>

      {/* Modal para notificações */}
      <Modal
        transparent={true}
        visible={showNotifications}
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNotifications(false)}
        >
          <View
            style={[
              styles.notificationDropdown,
              {
                top: dropdownPosition.top,
                right: dropdownPosition.right,
                width: Platform.OS === "android" ? 250 : 280,
              },
            ]}
          >
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationHeaderTitle}>Notificações</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleNotifications}
              >
                <Text style={styles.viewAllText}>Ver Todas</Text>
              </TouchableOpacity>
            </View>

            {notifications.length > 0 ? (
              <FlatList
                data={notifications.slice(0, 5)}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.notificationList}
              />
            ) : (
              <Text style={styles.noNotifications}>
                Nenhuma notificação disponível
              </Text>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: "transparent",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 16,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    right: -6,
    top: -5,
    backgroundColor: "#FF5252",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  notificationDropdown: {
    position: "absolute",
    maxHeight: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  notificationHeaderTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#324c6e",
  },
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    color: "#324c6e",
    fontWeight: "500",
  },
  notificationList: {
    padding: 8,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#F9F9F9",
  },
  notificationRead: {
    backgroundColor: "#FFFFFF",
    opacity: 0.7,
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "#324c6e",
  },
  notificationBody: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
    color: "#999999",
  },
  deleteButton: {
    padding: 8,
  },
  noNotifications: {
    padding: 16,
    textAlign: "center",
    color: "#999999",
  },
});
