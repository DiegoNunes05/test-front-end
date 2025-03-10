import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const {login} = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert(
        "Erro de Autenticação",
        "E-mail ou senha inválidos. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.push("/(public)/signup");
  };

  const navigateToForgotPassword = () => {
    router.push("/(public)/forgot-password");
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
          <Text style={styles.welcomeText}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>

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
                color="#757575"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={navigateToForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.noAccountText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={navigateToSignup}>
              <Text style={styles.signupText}>Cadastre-se</Text>
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
    marginTop:70,
    marginBottom: 40,
  },
  newLogo: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent  : "center",
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
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#0D47A1",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#0D47A1",
    borderRadius: 8,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  noAccountText: {
    color: "#757575",
    fontSize: 14,
  },
  signupText: {
    color: "#0D47A1",
    fontWeight: "bold",
    fontSize: 14,
  },
});
