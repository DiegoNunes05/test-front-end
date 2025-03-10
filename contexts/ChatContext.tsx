// context/ChatContext.js
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import FloatingChat from "../components/FloatingChat";
import {messagesApi} from "@/services/api";
import {useAuth} from "@/hooks/useAuth";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  receiverId: string;
  userName: string;
  read: boolean;
  createdAt: Date;
}
// Cria o contexto
interface ChatContextType {
  showChat: (chatId?: string) => void;
  hideChat: () => void;
  toggleChat: (chatId?: string) => void;
  isVisible: boolean;
  currentChatId: string;
  unreadCount: number;
}

// Create the context with a default value
const ChatContext = createContext<ChatContextType>({
  showChat: () => {},
  hideChat: () => {},
  toggleChat: () => {},
  isVisible: false,
  currentChatId: "support",
  unreadCount: 0,
});

// Provider do contexto
export const ChatProvider = ({children}: {children: ReactNode}) => {
  const {user} = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("support");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadMessages = async () => {
      try {
        console.log("Buscando mensagens para usuário:", user.uid);

        // Para fins de desenvolvimento, vamos usar "1" como ID fixo ou o uid do usuário
        const userId =
          user.uid === "HbOwH0rOuNNNaP93DK1hVOhSb7u1" ? "1" : user.uid;

        // Obter todas as mensagens
        const response = await messagesApi.getByDriver(userId);
        console.log("Mensagens recebidas:", response.data);

        // Filtrar apenas as não lidas onde o usuário é o destinatário
        const unreadMessages = response.data.filter(
          (msg: Message) => !msg.read && msg.receiverId === userId
        );

        console.log("Mensagens não lidas:", unreadMessages.length);
        setUnreadCount(unreadMessages.length);
      } catch (error) {
        console.error("Erro ao buscar mensagens não lidas:", error);
      }
    };

    fetchUnreadMessages();

    // Atualizar contagem periodicamente
    const interval = setInterval(fetchUnreadMessages, 10000); // a cada 10 segundos

    return () => clearInterval(interval);
  }, [user]);

  // Mostrar o chat
  const showChat = (chatId = "support") => {
    setCurrentChatId(chatId);
    setIsVisible(true);

    // Quando o chat é aberto, podemos marcar as mensagens como lidas
    // (isso exigiria uma função adicional na API)
  };

  // Esconder o chat
  const hideChat = () => {
    setIsVisible(false);
  };

  // Toggle para mostrar o chat
  const toggleChat = (chatId = "support") => {
    showChat(chatId);
  };

  const handleChatClose = () => {
    setIsVisible(false);
  };

  return (
    <ChatContext.Provider
      value={{
        showChat,
        hideChat,
        toggleChat,
        isVisible,
        currentChatId,
        unreadCount,
      }}
    >
      {children}
      {isVisible && (
        <FloatingChat chatId={currentChatId} onClose={handleChatClose} />
      )}
    </ChatContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat deve ser usado dentro de um ChatProvider");
  }
  return context;
};
