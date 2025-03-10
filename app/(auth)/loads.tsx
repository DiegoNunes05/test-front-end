// /(auth)/loads.tsx
import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import {loadsApi} from "../../services/api";
import Header from "@/components/Header";
import ChatButton from "@/components/ChatButton";
import { Load } from "@/types/types";

export default function LoadsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loads, setLoads] = useState<Load[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLoads = async () => {
    try {
      setError(null);
      const response = await loadsApi.getAll();
      setLoads(response.data);
      setFilteredLoads(response.data);
    } catch (error) {
      console.error("Erro ao buscar cargas:", error);
      setError("Não foi possível carregar as cargas. Verifique sua conexão.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, []);

  useEffect(() => {
    let result = [...loads];

    if (activeFilter) {
      result = result.filter((load) => load.status === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (load) =>
          load.address.toLowerCase().includes(query) ||
          load.city.toLowerCase().includes(query) ||
          load.state.toLowerCase().includes(query) ||
          load.clientName.toLowerCase().includes(query) ||
          load.description.toLowerCase().includes(query)
      );
    }

    setFilteredLoads(result);
  }, [loads, searchQuery, activeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    fetchLoads();
  };

  const navigateToLoadDetails = (loadId: string) => {
    router.push(`/(auth)/load-details/${loadId}`);
  };

  const finishDelivery = async () => {
    try {
      // Encontrar todas as cargas em andamento
      const inProgressLoads = loads.filter(
        (load) => load.status === "in_progress"
      );

      if (inProgressLoads.length === 0) {
        return;
      }
      
      Alert.alert(
        "Finalizar entregas",
        `Você tem ${inProgressLoads.length} entrega(s) em andamento. Deseja marcar como concluídas?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Finalizar",
            onPress: async () => {
              setLoading(true);
              try {

                for (const load of inProgressLoads) {
                  await loadsApi.updateStatus(load.id, "completed");
                }
                fetchLoads();

                Alert.alert("Sucesso", "Entregas finalizadas com sucesso!");
              } catch (error) {
                console.error("Erro ao finalizar entregas:", error);
                Alert.alert(
                  "Erro",
                  "Não foi possível finalizar as entregas. Tente novamente."
                );
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao finalizar viagem:", error);
    }
  };

  const renderLoadItem = ({item}: {item: Load}) => {
    let statusColor = "#FFC107"; 
    let statusIcon = "time-outline";

    if (item.status === "in_progress") {
      statusColor = "#2196F3"; 
      statusIcon = "arrow-forward";
    } else if (item.status === "completed") {
      statusColor = "#4CAF50"; 
      statusIcon = "checkmark-circle";
    }

    return (
      <TouchableOpacity
        style={styles.loadItem}
        onPress={() => navigateToLoadDetails(item.id)}
      >
        <View style={[styles.statusIndicator, {backgroundColor: statusColor}]}>
          <Ionicons name={statusIcon as any} size={16} color="#FFFFFF" />
        </View>

        <View style={styles.loadInfo}>
          <Text style={styles.loadAddress}>{item.address}</Text>
          <Text style={styles.loadLocation}>
            {item.city}, {item.state}
          </Text>
          <Text style={styles.loadLocation}>
            {item.origin} → {item.destination}
          </Text>
          <Text style={styles.loadItems}>
            {item.items} {item.items === 1 ? "pacote" : "pacotes"} •{" "}
            {item.weight}kg
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={24} color="#757575" />
      </TouchableOpacity>
    );
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === null && styles.filterButtonActive,
        ]}
        onPress={() => setActiveFilter(null)}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === null && styles.filterTextActive,
          ]}
        >
          Todos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === "pending" && styles.filterButtonActive,
        ]}
        onPress={() => setActiveFilter("pending")}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "pending" && styles.filterTextActive,
          ]}
        >
          Pendentes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === "in_progress" && styles.filterButtonActive,
        ]}
        onPress={() => setActiveFilter("in_progress")}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "in_progress" && styles.filterTextActive,
          ]}
        >
          Em andamento
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === "completed" && styles.filterButtonActive,
        ]}
        onPress={() => setActiveFilter("completed")}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "completed" && styles.filterTextActive,
          ]}
        >
          Concluídos
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Componente principal
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#757575"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar endereço, cliente..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9E9E9E"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#757575" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filtros */}
      {renderFilterButtons()}

      {/* Banner para cargas em andamento (simulando cenário de entrega ativa) */}
      {filteredLoads.some((load) => load.status === "in_progress") && (
        <View style={styles.activeDeliveryBanner}>
          <View style={styles.activeDeliveryContent}>
            <View style={styles.activeDeliveryTextContainer}>
              <Text style={styles.activeDeliveryTitle}>
                Você está a caminho!
              </Text>
              <Text style={styles.activeDeliverySubtitle}>
                Ver no Google Maps
              </Text>
            </View>
            <TouchableOpacity
              style={styles.finishDeliveryButton}
              onPress={finishDelivery}
            >
              <Text style={styles.finishDeliveryText}>Finalizar viagem</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D47A1" />
          <Text style={styles.loadingText}>Carregando cargas...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-offline" size={64} color="#757575" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchLoads}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredLoads}
          renderItem={renderLoadItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.loadsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube" size={64} color="#BDBDBD" />
              <Text style={styles.emptyText}>Nenhuma carga encontrada</Text>
              <Text style={styles.emptySubtext}>
                Tente mudar os filtros ou a busca
              </Text>
            </View>
          }
        />
      )}
      <View style={styles.chatButtonContainer}>
        <ChatButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 16,
    height: 48,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#212121",
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: "#324c6e",
  },
  filterText: {
    color: "#757575",
    fontSize: 14,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  activeDeliveryBanner: {
    backgroundColor: "#FFEB3B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  activeDeliveryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeDeliveryTextContainer: {
    flex: 1,
  },
  activeDeliveryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
  },
  activeDeliverySubtitle: {
    fontSize: 14,
    color: "#0D47A1",
    textDecorationLine: "underline",
  },
  finishDeliveryButton: {
    backgroundColor: "#324c6e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  finishDeliveryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loadsList: {
    padding: 16,
  },
  loadItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  loadInfo: {
    flex: 1,
  },
  loadAddress: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },
  loadLocation: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  loadItems: {
    fontSize: 14,
    color: "#0D47A1",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#757575",
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#324c6e",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#757575",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
  },
  chatButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 15,
  },
});
