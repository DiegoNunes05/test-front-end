import React, {createContext, useState, useContext, useEffect} from "react";
import {notificationsApi} from "@/services/api";
import {useAuth} from "@/hooks/useAuth";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  loadId?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextData>(
  {} as NotificationContextData
);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const {user} = useAuth(); 

  const countUnread = (notificationList: Notification[]) => {
    const count = notificationList.filter(
      (notification) => !notification.read
    ).length;
    setUnreadCount(count);
  };

  const fetchNotifications = async () => {
    try {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const response = await notificationsApi.getByDriver(user.uid);
      const notificationsData = response.data;

      setNotifications(notificationsData);
      countUnread(notificationsData);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);

      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? {...notification, read: true} : notification
      );

      setNotifications(updatedNotifications);
      countUnread(updatedNotifications);
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadNotifications = notifications.filter((n) => !n.read);

      for (const notification of unreadNotifications) {
        await notificationsApi.markAsRead(notification.id);
      }

      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true,
      }));

      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const updatedNotifications = notifications.filter(
        (notification) => notification.id !== id
      );

      setNotifications(updatedNotifications);
      countUnread(updatedNotifications);
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
    }
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]); 

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification deve ser usado dentro de um NotificationProvider"
    );
  }

  return context;
};
