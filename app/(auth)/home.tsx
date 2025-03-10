import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import {router, useFocusEffect} from "expo-router";
import Header from "@/components/Header";
import ChatButton from "@/components/ChatButton";
import { useAuth } from "@/hooks/useAuth";
import { loadsApi } from "@/services/api";
import { Load } from "@/types/types";
import LineBillor from "@/components/LineBillor";

const {width} = Dimensions.get("window");
const imageSize = Platform.OS === "android" ? Math.min(width * 0.9, 280) : 320;

export default function HomeScreen() {
  const {user} = useAuth(); 
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [totalKilometers, setTotalKilometers] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchCompletedDeliveries = async () => {
        try {
          const response = await loadsApi.getCompletedLoads();

          const deliveriesCount = response.data.length;
          setCompletedDeliveries(deliveriesCount);

          const totalKm = response.data.reduce(
            (sum: number, load: Load) => sum + (load.distance || 0),
            0
          );
          setTotalKilometers(Math.round(totalKm));
        } catch (error) {
          console.error("Erro ao buscar entregas concluídas:", error);
          setCompletedDeliveries(0);
          setTotalKilometers(0);
        }
      };

      if (user) {
        fetchCompletedDeliveries();
      }
    }, [user])
  );

  const handleLoads = () => {
    router.push("/(auth)/loads");
  };

  console.log("ID do usuário logado:", user?.uid);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.contentFlexGrow}>
        <View style={styles.viewTruck}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/dnukxp5ng/image/upload/v1741453323/caminhao-de-transporte-desenhado-a-mao_ezk2cn.png",
              }}
              style={styles.truckImage}
              resizeMode="contain"
            />
        </View>
        <LineBillor />

        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo</Text>

            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{completedDeliveries}</Text>
                <Text style={styles.summaryLabel}>Entregas</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalKilometers}</Text>
                <Text style={styles.summaryLabel}>Km Percorridos</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.buttonPrimary} onPress={handleLoads}>
            <Text style={styles.buttonPrimaryText}>Ver Cargas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.chatButtonContainer}>
        <ChatButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentFlexGrow: {
    flexGrow: 1,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#324c6e",
    width: "50%",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 12,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#757575",
  },
  divider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  buttonPrimary: {
    backgroundColor: "#324c6e",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewTruck: {
    alignItems: "flex-end",
    zIndex: 10,
  },
  truckImage: {
    width: imageSize,
    height: imageSize,
  },
  chatButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 15,
  },
});
