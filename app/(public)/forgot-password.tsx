import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../hooks/useAuth";
import LogoSvg from "../../assets/Billor-logo.svg";
import Svg from "react-native-svg";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {resetPassword} = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, insira seu e-mail.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido.");
      return;
    }

    try {
      setIsLoading(true);
      const {success, error} = await resetPassword(email);

      if (success) {
        Alert.alert(
          "E-mail enviado",
          "Enviamos instruções para redefinir sua senha para o e-mail fornecido.",
          [{text: "OK", onPress: () => router.replace("/(public)/login")}]
        );
      } else {
        Alert.alert(
          "Erro",
          error || "Não foi possível enviar o e-mail de recuperação."
        );
      }
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar o e-mail de recuperação. Verifique se o e-mail está correto."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.replace("/(public)/login");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.newLogo}>
            <Svg width="120" height="100">
              <LogoSvg width={120} height={120} />
            </Svg>
            <Text style={styles.appName}>Driver App</Text>
          </View>
          <Text style={styles.tagline}>Seu app de gestão de entregas</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Esqueceu sua senha?</Text>
          <Text style={styles.subtitle}>
            Informe seu e-mail para receber instruções de recuperação
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail"
              size={20}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#9E9E9E"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardAppearance="dark"
            />
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.resetButtonText}>Enviar instruções</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.hasAccountText}>Lembrou sua senha? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginText}>Faça login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 70,
    marginBottom: 40,
  },
  newLogo: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 20,
    marginTop: -17,
    marginLeft: 95,
  },
  tagline: {
    fontSize: 16,
    color: "#616161",
  },
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 12,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#212121",
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: "#0D47A1",
    borderRadius: 8,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  hasAccountText: {
    color: "#757575",
    fontSize: 14,
  },
  loginText: {
    color: "#0D47A1",
    fontWeight: "bold",
    fontSize: 14,
  },
});
