import React, {useState, useEffect, useRef} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/hooks/useAuth";
import {messagesApi} from "@/services/api";
import { Conversation, Message } from "@/types/types";
import Header from "@/components/Header";

export default function ChatScreen() {
  const {user} = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const messagesListRef = useRef<FlatList>(null);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const userId = '1'

      const response = await messagesApi.getByDriver(userId);
      const allMessages = response.data;

      const conversationsMap = new Map();

      allMessages.forEach((msg: Message) => {
        const otherPartyId =
          msg.senderId === user.uid ? msg.receiverId : msg.senderId;
        const otherPartyName =
          msg.senderId === user.uid
            ? msg.receiverName || "Suporte"
            : msg.userName || "Suporte";

        if (!conversationsMap.has(otherPartyId)) {
          conversationsMap.set(otherPartyId, {
            id: otherPartyId,
            title: otherPartyName,
            messages: [],
            unreadCount: 0,
          });
        }

        const conversation = conversationsMap.get(otherPartyId);
        conversation.messages.push(msg);

        if (!msg.read && msg.receiverId === user.uid) {
          conversation.unreadCount += 1;
        }
      });

      const conversations = Array.from(conversationsMap.values()).map(
        (conv) => {
          const sortedMessages = conv.messages.sort(
            (a: Message, b: Message) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          const lastMessage = sortedMessages[0];

          return {
            id: conv.id,
            title: conv.title,
            lastMessage: lastMessage?.text || "",
            timestamp: lastMessage?.timestamp || new Date().toISOString(),
            unreadCount: conv.unreadCount,
          };
        }
      );

      conversations.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setConversations(conversations);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await messagesApi.getAllUserMessages("1"); 

      console.log("Total de mensagens:", response.data.length);

      const chatMessages = response.data.filter(
        (msg: Message) =>
          msg.conversationId === "support-1" ||
          (msg.senderId === chatId && msg.receiverId === "1") ||
          (msg.senderId === "1" && msg.receiverId === chatId)
      );

      console.log("Mensagens da conversa:", chatMessages.length);

      chatMessages.sort(
        (a: Message, b: Message) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setMessages(chatMessages);

      const unreadMessages = chatMessages.filter(
        (msg: Message) => !msg.read && msg.receiverId === "1"
      );
      const markReadPromises = unreadMessages.map((msg: Message) =>
        messagesApi.markAsRead(msg.id)
      );
      await Promise.all(markReadPromises);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === chatId ? {...conv, unreadCount: 0} : conv
        )
      );
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user) return;

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        senderId: user.uid,
        receiverId: selectedChat,
        text: messageText.trim(),
        read: false,
        userName: user.name || "Você",
        conversationId: "support-1",
      };

      await messagesApi.send(newMessage);
      setMessages((prev) => [...prev, newMessage]);

      setMessageText("");

      setTimeout(() => {
        messagesListRef.current?.scrollToEnd({animated: true});
      }, 100);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const renderMessageItem = ({item}: {item: Message}) => {
    const isOwnMessage = item.senderId === "1" || item.senderId === user?.uid;

    const handleLongPress = () => {
      if (isOwnMessage) {
        Alert.alert("Excluir mensagem", "Deseja excluir esta mensagem?", [
          {text: "Cancelar", style: "cancel"},
          {
            text: "Excluir",
            onPress: () => deleteMessage(item.id),
            style: "destructive",
          },
        ]);
      }
    };

    return (
      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={isOwnMessage ? 0.7 : 1}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage
              ? styles.clientMessageBubble
              : styles.supportMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageSender,
              isOwnMessage ? styles.clientSender : styles.supportSender,
            ]}
          >
            {isOwnMessage ? "Você" : "Suporte Técnico"}
          </Text>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await messagesApi.deleteMessage(messageId);

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      Alert.alert("Erro", "Não foi possível excluir a mensagem");
    }
  };

  const renderConversationItem = ({item}: {item: Conversation}) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        selectedChat === item.id && styles.selectedConversation,
      ]}
      onPress={() => handleSelectChat(item.id)}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.title.charAt(0)}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{item.title}</Text>
          <Text style={styles.conversationTime}>
            {formatTime(new Date(item.timestamp))}
          </Text>
        </View>
        <Text
          style={[
            styles.lastMessage,
            item.unreadCount > 0 && styles.unreadMessage,
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
    </TouchableOpacity>
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
    } else if (diffDays === 1) {
      return "Ontem";
    } else if (diffDays < 7) {
      const days = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
      ];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString([], {day: "2-digit", month: "2-digit"});
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.header}>
        {selectedChat ? (
          <>
            <TouchableOpacity onPress={() => setSelectedChat(null)}>
              <Ionicons name="arrow-back" size={24} color="#324c6e" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {conversations.find((c) => c.id === selectedChat)?.title ||
                "Chat"}
            </Text>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#324c6e" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Histórico de Conversas</Text>
          </>
        )}
      </View>

      {/* Lista de conversas */}
      {!selectedChat && (
        <>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === "all" && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter("all")}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "all" && styles.activeFilterText,
                ]}
              >
                Todas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === "active" && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter("active")}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "active" && styles.activeFilterText,
                ]}
              >
                Ativas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === "archived" && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter("archived")}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "archived" && styles.activeFilterText,
                ]}
              >
                Arquivadas
              </Text>
            </TouchableOpacity>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#324c6e" />
              <Text style={styles.loadingText}>Carregando conversas...</Text>
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={64} color="#BDBDBD" />
              <Text style={styles.emptyText}>Nenhuma conversa encontrada</Text>
              <Text style={styles.emptySubText}>
                Suas conversas com o suporte aparecerão aqui
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations.filter((conv) => {
                if (activeFilter === "all") return true;
                return true;
              })}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#324c6e"]}
                />
              }
            />
          )}
        </>
      )}

      {/* Visualização da conversa selecionada */}
      {selectedChat && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{flex: 1}}
          keyboardVerticalOffset={100}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#324c6e" />
              <Text style={styles.loadingText}>Carregando mensagens...</Text>
            </View>
          ) : (
            <FlatList
              ref={messagesListRef}
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              onLayout={() => {
                if (messagesListRef.current && messages.length > 0) {
                  messagesListRef.current.scrollToEnd({animated: false});
                }
              }}
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={messageText.trim() ? "#FFFFFF" : "#CCCCCC"}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#324c6e",
    marginLeft: 16,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: "#E8F0FE",
  },
  filterText: {
    color: "#757575",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#324c6e",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#757575",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#757575",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2,
    elevation: 2,
  },
  selectedConversation: {
    backgroundColor: "#E8F0FE",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#324c6e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  badgeContainer: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#F44336",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  conversationContent: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
  },
  conversationTime: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  lastMessage: {
    fontSize: 14,
    color: "#757575",
  },
  unreadMessage: {
    fontWeight: "bold",
    color: "#212121",
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: "80%",
  },
  ownMessageBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherMessageBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  messageUser: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#324c6e",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    color: "#212121",
  },
  messageTime: {
    fontSize: 10,
    color: "#9E9E9E",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#324c6e",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    alignSelf: "flex-end",
  },
  sendButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  clientMessageBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 2,
  },
  supportMessageBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 2,
  },
  messageHeader: {
    marginBottom: 3,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "bold",
  },
  clientSender: {
    color: "#075E54", 
  },
  supportSender: {
    color: "#324c6e", 
  },
});
