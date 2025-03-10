import React, {createContext, useState, useEffect, ReactNode} from "react";
import {onAuthStateChanged, updateEmail, updateProfile} from "firebase/auth";
import {router} from "expo-router";
import Toast from "react-native-toast-message";

import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
} from "../services/authService";
import {auth, firestore} from "../firebaseConfig";
import {doc, serverTimestamp, updateDoc} from "firebase/firestore";
import {
  getFirebasePasswordResetErrorMessage,
} from "../utils/firebaseErrorMessage"; 
import {User} from "../types/types"; 


export interface AuthContextData {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{success: boolean; error: string | null}>;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Configurando listener de autenticação");

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Estado de autenticação alterado:", !!firebaseUser);

      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          photoUrl: firebaseUser.photoURL || "",
          phone: "", 
          license: "", 
          licenseExpiry: "", 
          vehicle: "", 
          plate: "", 
        };
        console.log("Definindo usuário no estado:", userData);
        setUser(userData);
      } else {
        console.log("Nenhum usuário autenticado");
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log("Desvinculando listener de autenticação");
      unsubscribe();
    };
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    console.log("Iniciando cadastro:", {name, email});
    setLoading(true);

    try {
      const {user: newUser, error} = await registerUser(name, email, password);

      if (error) {
        console.error("Erro retornado pelo registerUser:", error);
        throw new Error(error);
      }

      console.log("Cadastro bem-sucedido:", !!newUser);

      Toast.show({
        type: "success",
        text1: "Cadastro Realizado",
        text2: "Bem-vindo à nossa plataforma!",
        visibilityTime: 3000,
        autoHide: true,
      });

      setTimeout(() => {
        router.replace("/(auth)/home");
      }, 500);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log("Iniciando login:", {email});
    setLoading(true);

    try {
      const {user: loggedUser, error} = await loginUser(email, password);

      if (error) {
        console.error("Erro retornado pelo loginUser:", error);
        throw new Error(error);
      }

      console.log("Login bem-sucedido:", !!loggedUser);

      Toast.show({
        type: "success",
        text1: "Login Realizado",
        text2: "Bem-vindo de volta!",
        visibilityTime: 3000,
        autoHide: true,
      });

      setTimeout(() => {
        router.replace("/(auth)/home");
      }, 500);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("Iniciando logout");
    setLoading(true);

    try {
      const {success, error} = await logoutUser();

      if (!success && error) {
        console.error("Erro retornado pelo logoutUser:", error);
        throw new Error(error);
      }

      console.log("Logout bem-sucedido");

      Toast.show({
        type: "success",
        text1: "Logout Realizado",
        text2: "Você saiu da conta com sucesso.",
        visibilityTime: 3000,
        autoHide: true,
      });

      router.replace("/(public)/login");
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    console.log("Solicitando reset de senha para:", email);
    setLoading(true);

    try {
      const result = await resetPassword(email);
      console.log("Resultado do reset de senha:", result);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Redefinição de Senha",
          text2: "Link de redefinição enviado para seu email.",
          visibilityTime: 4000,
          autoHide: true,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erro na Redefinição",
          text2: getFirebasePasswordResetErrorMessage(result.error || ""),
          visibilityTime: 4000,
          autoHide: true,
        });
      }

      return result;
    } catch (error) {
      console.error("Erro ao solicitar reset de senha:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user || !auth.currentUser) {
      throw new Error("Usuário não autenticado");
    }

    try {
      if (userData.profileImage || userData.photoURL) {
        await updateProfile(auth.currentUser, {
          photoURL: userData.profileImage || userData.photoURL,
        });
      }

      const userDocRef = doc(firestore, "users", user.id);
      await updateDoc(userDocRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });

      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              ...userData,
              photoURL: userData.profileImage || userData.photoURL,
            }
          : null
      );

      Toast.show({
        type: "success",
        text1: "Perfil Atualizado",
        text2: "Suas informações foram atualizadas.",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);

      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar o perfil",
      });

      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        updateUserProfile,
        login,
        logout,
        resetPassword: requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
