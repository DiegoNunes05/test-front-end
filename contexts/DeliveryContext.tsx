
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

export interface Delivery {
  id: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryComplement: string;
  deliveryCity: string;
  deliveryZipCode: string;
  packageDescription: string;
  deliveryInstructions: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: Date;
  totalDistance?: number; 
}

interface DeliveryContextData {
  deliveries: Delivery[];
  addDelivery: (
    delivery: Omit<Delivery, "id" | "status" | "createdAt">
  ) => Promise<void>;
  updateDelivery: (id: string, data: Partial<Delivery>) => Promise<void>;
  totalDeliveries: number;
  totalDistance: number;
  loading: boolean;
}

const DeliveryContext = createContext<DeliveryContextData>(
  {} as DeliveryContextData
);

interface DeliveryProviderProps {
  children: ReactNode;
}

export function DeliveryProvider({children}: DeliveryProviderProps) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const deliveriesRef = collection(db, "deliveries");

    const q = query(deliveriesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deliveriesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Delivery;
        });

        setDeliveries(deliveriesData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar entregas:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addDelivery = async (
    deliveryData: Omit<Delivery, "id" | "status" | "createdAt">
  ) => {
    try {
      const newDeliveryData = {
        ...deliveryData,
        status: "pending",
        createdAt: new Date(),
        totalDistance: Math.floor(Math.random() * 10) + 1, 
      };

      await addDoc(collection(db, "deliveries"), newDeliveryData);

    } catch (error) {
      console.error("Erro ao adicionar entrega:", error);
      throw error;
    }
  };

  const updateDelivery = async (id: string, data: Partial<Delivery>) => {
    try {
      const deliveryRef = doc(db, "deliveries", id);
      await updateDoc(deliveryRef, data);

    } catch (error) {
      console.error("Erro ao atualizar entrega:", error);
      throw error;
    }
  };

  const totalDeliveries = deliveries.length;
  const totalDistance = deliveries.reduce(
    (acc, delivery) => acc + (delivery.totalDistance || 0),
    0
  );

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        addDelivery,
        updateDelivery,
        totalDeliveries,
        totalDistance,
        loading,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const context = useContext(DeliveryContext);

  if (!context) {
    throw new Error("useDelivery deve ser usado dentro de um DeliveryProvider");
  }

  return context;
}
