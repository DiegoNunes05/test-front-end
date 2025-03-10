import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../hooks/useAuth";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const {user, updateUserProfile, logout} = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    license: "",
    licenseExpiry: "",
    vehicle: "",
    plate: "",
  });
  const [profileImage, setProfileImage] = useState<string | undefined>(
    undefined
  );
  const [showImageOptions, setShowImageOptions] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        license: user.license || "",
        licenseExpiry: user.licenseExpiry || "",
        vehicle: user.vehicle || "",
        plate: user.plate || "",
      });
      setProfileImage(user.profileImage || undefined);
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!form.name || !form.email || !form.phone) {
        Alert.alert(
          "Dados incompletos",
          "Nome, email e telefone são obrigatórios."
        );
        return;
      }

      await updateUserProfile({
        ...form,
        profileImage,
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert(
        "Erro",
        "Não foi possível atualizar o perfil. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        license: user.license || "",
        licenseExpiry: user.licenseExpiry || "",
        vehicle: user.vehicle || "",
        plate: user.plate || "",
      });
      setProfileImage(user.profileImage || undefined);
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Erro ao fazer logout:", error);
            Alert.alert(
              "Erro",
              "Não foi possível fazer logout. Tente novamente."
            );
          }
        },
      },
    ]);
  };

  const takePicture = async () => {
    const {status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Precisamos de permissão para acessar sua câmera."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao capturar imagem:", error);
      Alert.alert("Erro", "Não foi possível capturar a imagem.");
    } finally {
      setShowImageOptions(false);
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    } finally {
      setShowImageOptions(false);
    }
  };

  const removeProfilePicture = () => {
    setProfileImage(undefined);
    setShowImageOptions(false);
  };

  const getUserInitials = () => {
    if (!form.name) return "U";

    const names = form.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* Área de Foto de Perfil */}
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={() => isEditing && setShowImageOptions(true)}
        >
          {profileImage ? (
            <Image source={{uri: profileImage}} style={styles.profileImage} />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>{getUserInitials()}</Text>
            </View>
          )}
        </TouchableOpacity>

        {isEditing && (
          <View style={styles.editImageBadge}>
            <Ionicons
              name={profileImage ? "pencil" : "camera"}
              size={18}
              color="#FFFFFF"
              style={{zIndex: 100}}
            />

          </View>
        )}
        <Text style={styles.userName}>{form.name || "Usuário"}</Text>
        <Text style={styles.userEmail}>
          {form.email || "Email não informado"}
        </Text>

        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editingButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.formContainer}>
        {/* Informações Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Digite seu nome completo"
              editable={isEditing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={form.email}
              onChangeText={(text) => handleChange("email", text)}
              placeholder="Digite seu email"
              keyboardType="email-address"
              editable={isEditing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={form.phone}
              onChangeText={(text) => handleChange("phone", text)}
              placeholder="Digite seu telefone"
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>
        </View>

        {/* Informações do Motorista */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Motorista</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>CNH</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={form.license}
              onChangeText={(text) => handleChange("license", text)}
              placeholder="Digite o número da sua CNH"
              editable={isEditing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Validade da CNH</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={form.licenseExpiry}
              onChangeText={(text) => handleChange("licenseExpiry", text)}
              placeholder="DD/MM/AAAA"
              editable={isEditing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Veículo</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={form.vehicle}
              onChangeText={(text) => handleChange("vehicle", text)}
              placeholder="Modelo do veículo"
              editable={isEditing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Placa</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={form.plate}
              onChangeText={(text) => handleChange("plate", text)}
              placeholder="Placa do veículo"
              editable={isEditing}
            />
          </View>
        </View>

        {/* Opções da conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <TouchableOpacity style={styles.accountOption}>
            <Ionicons name="lock-closed-outline" size={24} color="#324c6e" />
            <Text style={styles.accountOptionText}>Alterar Senha</Text>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountOption}>
            <Ionicons name="notifications-outline" size={24} color="#324c6e" />
            <Text style={styles.accountOptionText}>Notificações</Text>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountOption} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
            <Text style={[styles.accountOptionText, {color: "#F44336"}]}>
              Sair da Conta
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal para opções de imagem */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Foto de Perfil</Text>

            <TouchableOpacity style={styles.modalOption} onPress={takePicture}>
              <Ionicons name="camera" size={24} color="#324c6e" />
              <Text style={styles.modalOptionText}>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={selectFromGallery}
            >
              <Ionicons name="image" size={24} color="#324c6e" />
              <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={removeProfilePicture}
              >
                <Ionicons name="trash" size={24} color="#F44336" />
                <Text style={[styles.modalOptionText, {color: "#F44336"}]}>
                  Remover Foto
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#324c6e",
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  initialsContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#4A6990",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  editImageBadge: {
    position: "absolute",
    top: 115,
    right: 140,
    backgroundColor: "#4A6990",
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 100,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#E0E0E0",
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "500",
  },
  editingButtonsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  formContainer: {
    padding: 16,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#324c6e",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#212121",
  },
  disabledInput: {
    backgroundColor: "#EEEEEE",
    color: "#757575",
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  accountOptionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: "#212121",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#212121",
    marginLeft: 16,
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#757575",
  },
});
