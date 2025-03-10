export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  licens?: string;
  licenseExpiry?: string;
  vehicle?: string;
  plate?: string;
  profileImage?: string;
  photoURL?: string;
  [key: string]: any;
}

export interface Load {
  id: string;
  origin: string;
  destination: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: "pending" | "in_progress" | "completed";
  pickupDate: string;
  deliveryDate: string;
  weight: number;
  items: number;
  description: string;
  clientName: string;
  clientPhone: string;
  paymentValue: number;
  paymentStatus: string;
  distance: number;
  documents: any[];
}

export interface Document {
  id: string;
  name: string;
  imageUrl: string;
  uri: string;
  uploadDate: string;
  type: "pickup_receipt" | "delivery_receipt" | "payment_receipt" | "other";
  status: "pending" | "approved" | "rejected";
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  receiverName?: string;
  timestamp: string;
  read: boolean;
  userName?: string;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}