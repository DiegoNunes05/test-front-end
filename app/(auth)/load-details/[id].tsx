import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
  Modal,
} from "react-native";
import {useLocalSearchParams, router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {documentsApi, loadsApi} from "@/services/api";
import * as ImagePicker from "expo-image-picker";
import Header from "@/components/Header";
import ChatButton from "@/components/ChatButton";
import Toast from "react-native-toast-message";
import {Load, Document} from "@/types/types";

export default function LoadDetailsScreen() {
  const {id} = useLocalSearchParams();
  const [load, setLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showImageModal, setShowImageModal] = useState(false);
  const [documentType, setDocumentType] = useState("delivery_receipt");

  useEffect(() => {
    const fetchLoadDetails = async () => {
      try {
        setLoading(true);
        setLoadingDocuments(true);
        setError(null);
        const loadResponse = await loadsApi.getById(id as string);
        setLoad(loadResponse.data);
        const docsResponse = await documentsApi.getByLoadId(id as string);
        setDocuments(docsResponse.data);
      } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
        setError(
          "Não foi possível carregar os detalhes. Verifique sua conexão."
        );
      } finally {
        setLoading(false);
        setLoadingDocuments(false);
      }
    };

    if (id) {
      fetchLoadDetails();
    }
  }, [id]);

  const handleUpdateStatus = async (
    newStatus: "pending" | "in_progress" | "completed"
  ) => {
    if (!load) return;

    try {
      setLoading(true);
      await loadsApi.updateStatus(load.id, newStatus);

      setLoad({...load, status: newStatus});

      Toast.show({
        type: "success",
        text1: "Status Atualizado",
        text2: `Carga marcada como ${
          newStatus === "pending"
            ? "pendente"
            : newStatus === "in_progress"
            ? "em andamento"
            : "concluída"
        }`,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar o status da carga.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (!load) return;

    Linking.openURL(`tel:${load.clientPhone}`);
  };

  const handleOpenMaps = () => {
    if (!load) return;

    const address = `${load.address}, ${load.city}, ${load.state}, ${load.zipCode}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;

    Linking.openURL(url);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#324c6e" />
        <Text style={styles.loadingText}>Carregando detalhes da carga...</Text>
      </View>
    );
  }

  if (error || !load) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error || "Carga não encontrada."}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDeleteDocument = (documentId: string) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este documento?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await documentsApi.deleteDocument(documentId);
              const updatedDocs = documents.filter(
                (doc) => doc.id !== documentId
              );
              setDocuments(updatedDocs);
              setShowImageModal(false);
              setSelectedDocument(null);

              Toast.show({
                type: "success",
                text1: "Sucesso",
                text2: "Documento excluído com sucesso!",
              });
            } catch (error) {
              console.error("Erro ao excluir documento:", error);
              Toast.show({
                type: "error",
                text1: "Erro",
                text2: "Não foi possível excluir o documento. Tente novamente.",
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const requestCameraPermission = async () => {
    const {status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Precisamos de permissão para acessar sua câmera."
      );
      return false;
    }
    return true;
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newDocument = {
          loadId: id,
          type: documentType,
          name: `Comprovante_${load?.id || "entrega"}`,
          imageUrl: asset.uri,
          uploadDate: new Date().toISOString(),
          status: "pending",
        };

        try {
          // Enviar o documento para a API
          setLoading(true);
          await documentsApi.uploadDocument(newDocument);

          // Atualizar a lista de documentos
          const docsResponse = await documentsApi.getByLoadId(id as string);
          setDocuments(docsResponse.data);

          Toast.show({
            type: "success",
            text1: "Sucesso",
            text2: "Documento enviado com sucesso.",
          });
        } catch (error) {
          console.error("Erro ao enviar documento:", error);
          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Não foi possível enviar o documento. Tente novamente.",
          });
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Erro ao capturar imagem:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível capturar a imagem.",
      })
    }
  };

  const selectFromGallery = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Precisamos de permissão para acessar sua galeria."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        const newDocument = {
          loadId: id,
          type: documentType,
          name: `Comprovante_${load?.id || "entrega"}`,
          imageUrl: asset.uri,
          uploadDate: new Date().toISOString(),
          status: "pending",
        };

        try {
          setLoading(true);
          await documentsApi.uploadDocument(newDocument);

          const docsResponse = await documentsApi.getByLoadId(id as string);
          setDocuments(docsResponse.data);

          Toast.show({
            type: "success",
            text1: "Sucesso",
            text2: "Documento enviado com sucesso!",
          });
        } catch (error) {
          console.error("Erro ao enviar documento:", error);
          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Não foi possível enviar o documento. Tente novamente.",
          })
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível selecionar a imagem.",
      });
    }
  };

  const showDocumentOptions = () => {
    Alert.alert("Adicionar documento", "Escolha o tipo de documento", [
      {
        text: "Comprovante de Coleta",
        onPress: () => {
          setDocumentType("pickup_receipt");
          showCameraOptions();
        },
      },
      {
        text: "Comprovante de Entrega",
        onPress: () => {
          setDocumentType("delivery_receipt");
          showCameraOptions();
        },
      },
      {
        text: "Outro Documento",
        onPress: () => {
          setDocumentType("other");
          showCameraOptions();
        },
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  const showCameraOptions = () => {
    Alert.alert("Capturar Imagem", "Escolha uma opção", [
      {
        text: "Tirar foto",
        onPress: takePicture,
      },
      {
        text: "Escolher da galeria",
        onPress: selectFromGallery,
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  const renderDocuments = () => {
    if (loadingDocuments) {
      return (
        <View style={styles.loadingDocsContainer}>
          <ActivityIndicator size="small" color="#324c6e" />
          <Text style={styles.loadingDocsText}>Carregando documentos...</Text>
        </View>
      );
    }

    return (
      <View>
        {documents.length > 0 ? (
          <View>
            {documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.documentItem}
                onPress={() => {
                  setSelectedDocument(doc);
                  setShowImageModal(true);
                }}
              >
                <Image
                  source={{uri: doc.imageUrl || doc.uri}}
                  style={styles.documentThumbnail}
                />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {doc.type === "pickup_receipt"
                      ? "Comprovante de Coleta"
                      : doc.type === "delivery_receipt"
                      ? "Comprovante de Entrega"
                      : "Outro Documento"}
                  </Text>
                  <Text style={styles.documentDate}>
                    {new Date(doc.uploadDate).toLocaleDateString()}{" "}
                    {new Date(doc.uploadDate).toLocaleTimeString()}
                  </Text>
                  <View
                    style={[
                      styles.documentStatus,
                      doc.status === "approved"
                        ? styles.statusApproved
                        : doc.status === "rejected"
                        ? styles.statusRejected
                        : styles.statusPending,
                    ]}
                  >
                    <Text style={styles.documentStatusText}>
                      {doc.status === "approved"
                        ? "Aprovado"
                        : doc.status === "rejected"
                        ? "Rejeitado"
                        : "Pendente"}
                    </Text>
                  </View>
                </View>
                <Ionicons name="eye-outline" size={20} color="#324c6e" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyDocsContainer}>
            <Text style={styles.emptyDocsText}>Nenhum documento anexado</Text>
          </View>
        )}

        {load.status === "in_progress" && (
          <TouchableOpacity
            style={styles.addDocumentButton}
            onPress={showDocumentOptions}
          >
            <Ionicons name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.addDocumentButtonText}>
              {documents.length > 0
                ? "Adicionar Outro Documento"
                : "Adicionar Documento"}
            </Text>
          </TouchableOpacity>
        )}

        <Modal
          visible={showImageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedDocument?.type === "pickup_receipt"
                    ? "Comprovante de Coleta"
                    : selectedDocument?.type === "delivery_receipt"
                    ? "Comprovante de Entrega"
                    : "Documento"}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowImageModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#000000" />
                </TouchableOpacity>
              </View>

              <Image
                source={{
                  uri: selectedDocument?.imageUrl || selectedDocument?.uri,
                }}
                style={styles.fullImage}
                resizeMode="contain"
              />

              <View style={styles.modalActions}>
                {load.status === "in_progress" && (
                  <>
                    <TouchableOpacity
                      style={styles.replaceButton}
                      onPress={() => {
                        setShowImageModal(false);
                        setDocumentType(
                          selectedDocument?.type || "delivery_receipt"
                        );
                        showCameraOptions();
                      }}
                    >
                      <Ionicons name="camera" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Substituir</Text>
                    </TouchableOpacity>

                    {selectedDocument?.id && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          handleDeleteDocument(selectedDocument.id)
                        }
                      >
                        <Ionicons name="trash" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Excluir</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            load.status === "pending"
              ? styles.pendingBanner
              : load.status === "in_progress"
              ? styles.inProgressBanner
              : styles.completedBanner,
          ]}
        >
          <View style={styles.statusContent}>
            <Ionicons
              name={
                load.status === "pending"
                  ? "time-outline"
                  : load.status === "in_progress"
                  ? "arrow-forward"
                  : "checkmark-circle"
              }
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.statusText}>
              {load.status === "pending"
                ? "Pendente"
                : load.status === "in_progress"
                ? "Em andamento"
                : "Concluída"}
            </Text>
          </View>
        </View>

        {/* Rota */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rota</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={styles.originDot} />
              <Text style={styles.routeText}>{load.origin}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={styles.destinationDot} />
              <Text style={styles.routeText}>{load.destination}</Text>
            </View>
          </View>
          <Text style={styles.distanceText}>
            {load.distance} km • Aproximadamente {Math.ceil(load.distance / 80)}{" "}
            horas
          </Text>
        </View>

        {/* Endereço de Entrega */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Endereço de Entrega</Text>
          <Text style={styles.addressText}>{load.address}</Text>
          <Text style={styles.addressText}>
            {load.city}, {load.state}
          </Text>
          <Text style={styles.addressText}>CEP: {load.zipCode}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenMaps}>
            <Ionicons name="map" size={18} color="#FFFFFF" />
            <Text style={styles.mapButtonText}>Abrir no Google Maps</Text>
          </TouchableOpacity>
        </View>
        {/* Documentos da carga */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Documentos</Text>
          {renderDocuments()}
        </View>
        {/* Informações da Carga */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações da Carga</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Descrição:</Text>
            <Text style={styles.infoValue}>{load.description}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantidade:</Text>
            <Text style={styles.infoValue}>
              {load.items} {load.items === 1 ? "pacote" : "pacotes"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Peso:</Text>
            <Text style={styles.infoValue}>{load.weight} kg</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coleta:</Text>
            <Text style={styles.infoValue}>{formatDate(load.pickupDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Entrega:</Text>
            <Text style={styles.infoValue}>
              {formatDate(load.deliveryDate)}
            </Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome:</Text>
            <Text style={styles.infoValue}>{load.clientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefone:</Text>
            <Text style={styles.infoValue}>{load.clientPhone}</Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
            <Text style={styles.callButtonText}>Ligar para o Cliente</Text>
          </TouchableOpacity>
        </View>

        {/* Pagamento */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pagamento</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valor:</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(load.paymentValue)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text
              style={[
                styles.paymentStatus,
                load.paymentStatus === "pending"
                  ? styles.pendingPayment
                  : styles.paidPayment,
              ]}
            >
              {load.paymentStatus === "pending" ? "Pendente" : "Pago"}
            </Text>
          </View>
        </View>

        {/* Área de ações */}
        <View style={styles.actionsContainer}>
          {load.status === "pending" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpdateStatus("in_progress")}
            >
              <Text style={styles.actionButtonText}>Iniciar Entrega</Text>
            </TouchableOpacity>
          )}

          {load.status === "in_progress" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpdateStatus("completed")}
            >
              <Text style={styles.actionButtonText}>Marcar como Entregue</Text>
            </TouchableOpacity>
          )}

          {load.status === "completed" && (
            <View style={styles.completedContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.completedText}>Entrega Concluída</Text>
            </View>
          )}

        </View>
      </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#324c6e",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#324c6e",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  statusBanner: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  pendingBanner: {
    backgroundColor: "#FFC107",
  },
  inProgressBanner: {
    backgroundColor: "#2196F3",
  },
  completedBanner: {
    backgroundColor: "#4CAF50",
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 12,
  },
  routeContainer: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F44336",
    marginRight: 8,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: "#BDBDBD",
    marginLeft: 5,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 14,
    color: "#424242",
  },
  distanceText: {
    fontSize: 14,
    color: "#757575",
  },
  addressText: {
    fontSize: 14,
    color: "#424242",
    marginBottom: 4,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#324c6e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  mapButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "500",
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#424242",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  callButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "500",
  },
  paymentStatus: {
    fontWeight: "bold",
    fontSize: 16,
  },
  pendingPayment: {
    color: "#FFC107",
  },
  paidPayment: {
    color: "#4CAF50",
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  replaceButton: {
    backgroundColor: "#FF9800",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    backgroundColor: "#324c6e",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 16,
    marginLeft: 4,
  },
  documentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9800",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  documentButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 16,
    borderRadius: 8,
  },
  completedText: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  documentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212121",
  },
  documentDate: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  documentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  statusPending: {
    backgroundColor: "#FFF9C4",
  },
  statusApproved: {
    backgroundColor: "#E8F5E9",
  },
  statusRejected: {
    backgroundColor: "#FFEBEE",
  },
  documentStatusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  loadingDocsContainer: {
    padding: 16,
    alignItems: "center",
  },
  loadingDocsText: {
    marginTop: 8,
    fontSize: 14,
    color: "#757575",
  },
  emptyDocsContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyDocsText: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 12,
  },
  addDocButton: {
    backgroundColor: "#324c6e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addDocButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  addMoreButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
  addMoreButtonText: {
    color: "#324c6e",
    fontWeight: "bold",
  },
  addDocumentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#324c6e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  addDocumentButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    width: "100%",
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },
  closeButton: {
    padding: 4,
  },
  fullImage: {
    width: "100%",
    height: 400,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  replaceButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 0.8,
  },
  chatButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 15,
  },
});
