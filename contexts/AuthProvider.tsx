import React, {createContext, useState, useEffect} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import {router} from "expo-router";
import {auth, firestore} from "@/firebaseConfig";

export interface User {
  id: string;
  name: string;
  email: string | null;
  photoUrl: string;
  phone?: string;
  license?: string;
  licenseExpiry?: string;
  vehicle?: string;
  plate?: string;
  profileImage?: string;
  [key: string]: any;
}

export interface AuthContextData {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(firestore, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    const userData = userDoc.exists() ? userDoc.data() : {};

    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || "Usuário",
      email: firebaseUser.email,
      photoUrl: firebaseUser.photoURL || "",
      phone: userData.phone || "",
      license: userData.license || "",
      licenseExpiry: userData.licenseExpiry || "",
      vehicle: userData.vehicle || "",
      plate: userData.plate || "",
      profileImage: userData.profileImage || firebaseUser.photoURL || "",
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await fetchUserData(firebaseUser);
          setUser(userData);
          router.replace("/(auth)/home");
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Usuário",
            email: firebaseUser.email,
            photoUrl: firebaseUser.photoURL || "",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, {displayName: name});
      await setDoc(doc(firestore, "users", firebaseUser.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user || !auth.currentUser) {
      throw new Error("Usuário não autenticado");
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      const updates: Partial<User> = {};

      if (userData.name && userData.name !== user.name) {
        await updateProfile(currentUser, {displayName: userData.name});
        updates.name = userData.name;
      }

      if (userData.email && userData.email !== user.email) {
        await updateEmail(currentUser, userData.email);
        updates.email = userData.email;
      }

      if (
        userData.profileImage &&
        userData.profileImage !== user.profileImage
      ) {
        await updateProfile(currentUser, {photoURL: userData.profileImage});
        updates.photoUrl = userData.profileImage;
        updates.profileImage = userData.profileImage;
      }

      const userDocRef = doc(firestore, "users", user.id);

      const firestoreUpdates: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };

      Object.keys(userData).forEach((key) => {
        if (key !== "id" && userData[key] !== undefined) {
          firestoreUpdates[key] = userData[key];
        }
      });

      await updateDoc(userDocRef, firestoreUpdates);

      setUser((prev) => (prev ? {...prev, ...updates, ...userData} : null));
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUserProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
