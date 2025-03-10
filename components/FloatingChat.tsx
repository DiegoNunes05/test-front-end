// components/FloatingChat.tsx
import React, {useState, useEffect, useRef} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Keyboard,
  KeyboardEvent,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import {useAuth} from "../hooks/useAuth";
import {router} from "expo-router";
import {messagesApi} from "@/services/api";

interface Message {
  id: string;
  createdAt: Date;
  [key: string]: any;
}

interface FloatingChatProps {
  chatId?: string;
  onClose?: () => void;
}

const FloatingChat = ({chatId = "support", onClose}: FloatingChatProps) => {
  const {user} = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportOnline, setSupportOnline] = useState(true); 
  const animatedHeight = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList<any>>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      if (!isExpanded && onClose) {
        onClose();
      }
    });

    if (isExpanded && flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: false});
      }, 300);
    }
  }, [isExpanded, messages.length, onClose]);

  // Buscar mensagens da API
  useEffect(() => {
    if (!isExpanded || !user) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await messagesApi.getByDriver(user.uid);
        const messageList = response.data;

        // Ordenar mensagens por timestamp
        messageList.sort(
          (a: Message, b: Message) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setMessages(messageList);

        // Marcar mensagens como lidas (em um app real)
        // Isso exigiria uma função adicional na API
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Em um app real, você poderia configurar um polling para atualizar mensagens
    const interval = setInterval(fetchMessages, 10000); // Atualiza a cada 10 segundos

    return () => clearInterval(interval);
  }, [chatId, isExpanded, user]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      const newMessage: Message = {
        id: Date.now().toString(), // ID temporário até obter da API
        timestamp: new Date().toISOString(),
        senderId: user.uid,
        receiverId: "support", // ID do destinatário (suporte)
        text: message.trim(),
        userName: user.name || "Usuário",
        read: false,
        createdAt: new Date(), // Add the createdAt property
      };

      await messagesApi.send(newMessage);

      // Atualizar a lista de mensagens localmente para feedback imediato
      setMessages((prev) => [...prev, newMessage]);

      setMessage("");

      // Scroll para a última mensagem
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 100);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };
  const handleViewHistory = () => {
    // Fechar o chat flutuante
    if (onClose) onClose();

    // Navegar para a tela de histórico de chat
    router.push("/(auth)/chat");
  };

  const renderMessageItem = ({item}: {item: Message}) => {
    const isOwnMessage = item.senderId === user?.uid;

    return (
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.messageUser}>{item.userName || "Suporte"}</Text>
        )}
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  const chatHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 320],
  });

  const containerStyle = {
    ...styles.container,
    height: chatHeight,
    bottom: 50 + keyboardHeight,
  };

  return (
    <Animated.View style={containerStyle}>
      {/* Cabeçalho do chat */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(false)}
        activeOpacity={0.8}
      >
        <View style={styles.headerContent}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Suporte</Text>
          <View style={styles.statusIndicatorContainer}>
            <View
              style={[
                styles.statusIndicator,
                supportOnline ? styles.statusOnline : styles.statusOffline,
              ]}
            />
            <Text style={styles.statusText}>
              {supportOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleViewHistory}
          >
            <Ionicons name="time-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Conteúdo do chat (mensagens) */}
      {isExpanded && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.chatContent}
          keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 85}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#324c6e" />
              <Text style={styles.loadingText}>Carregando mensagens...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma mensagem ainda</Text>
              <Text style={styles.emptySubText}>
                Envie uma mensagem para iniciar a conversa
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onLayout={() => {
                if (flatListRef.current && messages.length > 0) {
                  flatListRef.current.scrollToEnd({animated: false});
                }
              }}
            />
          )}

          {/* Input para nova mensagem */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#9E9E9E"
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={message.trim() ? "#FFFFFF" : "#B0BEC5"}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    right: 15,
    width: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  header: {
    backgroundColor: "#324c6e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyButton: {
    marginRight: 12,
  },
  statusIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusOnline: {
    backgroundColor: "#4CAF50",
  },
  statusOffline: {
    backgroundColor: "#F44336",
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  chatContent: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messagesList: {
    padding: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#757575",
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#757575",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
  },
});

export default FloatingChat;
