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

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {signup} = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Por favor, insira um email válido.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      setIsLoading(true);
      await signup(name, email, password);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      Alert.alert(
        "Erro de Cadastro",
        "Não foi possível realizar o cadastro. Por favor, tente novamente."
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
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.welcomeText}>Crie sua conta</Text>
          <Text style={styles.subtitle}>
            Preencha os campos para se cadastrar
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="person"
              size={20}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#9E9E9E"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              keyboardAppearance="dark"
            />
          </View>

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

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#9E9E9E"
              keyboardType="default"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              keyboardAppearance="dark"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#000000"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar Senha"
              placeholderTextColor="#9E9E9E"
              keyboardType="default"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              keyboardAppearance="dark"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#000000"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.hasAccountText}>Já tem uma conta? </Text>
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
    marginTop: 60,
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
    marginBottom: 30,
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
  eyeIcon: {
    padding: 5,
  },
  signupButton: {
    backgroundColor: "#0D47A1",
    borderRadius: 8,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  signupButtonText: {
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
