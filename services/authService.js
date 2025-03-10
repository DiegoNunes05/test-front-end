import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig'; 

export const registerUser = async (name, email, password) => {
  try {
    console.log("Iniciando cadastro com:", { name, email });

    if (!auth) {
      console.error("Auth não está inicializado");
      return { user: null, error: "Serviço de autenticação não inicializado" };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Usuário criado com sucesso:", user.uid);

    await updateProfile(user, { displayName: name });
    
    console.log("Perfil atualizado com sucesso");

    try {
      await setDoc(doc(firestore, "users", user.uid), {
        name,
        email,
        createdAt: serverTimestamp()
      });
      console.log("Dados salvos no Firestore");
    } catch (firestoreError) {
      console.error("Erro ao salvar no Firestore:", firestoreError);
    }
    
    return { user, error: null };
  } catch (error) {
    console.error("Erro completo no cadastro:", error);
    return { user: null, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    if (!auth) {
      return { user: null, error: "Serviço de autenticação não inicializado" };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    if (!auth) {
      return { success: false, error: "Serviço de autenticação não inicializado" };
    }
    
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    if (!auth) {
      return { success: false, error: "Serviço de autenticação não inicializado" };
    }
    
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};