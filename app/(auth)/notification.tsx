// (auth)/notifications.tsx
import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {router} from "expo-router";
import {Notification, useNotification} from "@/contexts/NotificationContext";
import Header from "@/components/Header";

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotification();
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNavigateBack = () => {
    router.back();
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      Alert.alert("Informação", "Todas as notificações já foram lidas.");
      return;
    }

    Alert.alert(
      "Marcar todas como lidas",
      "Deseja marcar todas as notificações como lidas?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: markAllAsRead,
        },
      ]
    );
  };

  const handleDeleteNotification = (id: string) => {
    Alert.alert(
      "Excluir notificação",
      "Tem certeza que deseja excluir esta notificação?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: () => deleteNotification(id),
          style: "destructive",
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !notification.read;
    if (filterType === "read") return notification.read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_load":
        return (
          <MaterialIcons name="local-shipping" size={24} color="#4CAF50" />
        );
      case "payment":
        return <MaterialIcons name="attach-money" size={24} color="#2196F3" />;
      case "document":
        return <MaterialIcons name="description" size={24} color="#FF9800" />;
      case "delivery_update":
        return <MaterialIcons name="update" size={24} color="#9C27B0" />;
      default:
        return (
          <MaterialIcons
            name="notifications-active"
            size={24}
            color="#324c6e"
          />
        );
    }
  };

  const renderNotificationItem = ({item}: {item: Notification}) => (
    <TouchableOpacity
      style={[styles.notificationItem, item.read && styles.notificationRead]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationTitle,
            item.read && styles.notificationTextRead,
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.notificationBody,
            item.read && styles.notificationTextRead,
          ]}
        >
          {item.body}
        </Text>
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#f44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleNavigateBack}
        >
          <Ionicons name="arrow-back" size={24} color="#324c6e" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <MaterialIcons name="mark-email-read" size={24} color="#324c6e" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("all")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === "all" && styles.filterButtonTextActive,
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "unread" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("unread")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === "unread" && styles.filterButtonTextActive,
            ]}
          >
            Não lidas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "read" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("read")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === "read" && styles.filterButtonTextActive,
            ]}
          >
            Lidas
          </Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="notifications-off" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>Nenhuma notificação disponível</Text>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="filter-list-off" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>
            Nenhuma notificação corresponde ao filtro
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#324c6e"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#324c6e",
  },
  markAllButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: "#E9EFF6",
  },
  filterButtonText: {
    color: "#757575",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#324c6e",
    fontWeight: "bold",
  },
  notificationList: {
    padding: 8,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  notificationRead: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 0,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "#324c6e",
  },
  notificationBody: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 4,
  },
  notificationTextRead: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  notificationTime: {
    fontSize: 11,
    color: "#999999",
  },
  deleteButton: {
    alignSelf: "center",
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginTop: 16,
  },
});
