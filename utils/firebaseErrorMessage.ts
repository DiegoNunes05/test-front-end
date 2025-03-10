export const getFirebaseLoginErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/invalid-credential":
      return "Credenciais inválidas. Verifique seu email e senha.";
    case "auth/invalid-email":
      return "Email inválido. Verifique o formato.";
    case "auth/user-disabled":
      return "Esta conta foi desativada. Entre em contato com o suporte.";
    case "auth/user-not-found":
      return "Usuário não encontrado. Verifique o email ou crie uma conta.";
    case "auth/wrong-password":
      return "Senha incorreta. Tente novamente.";
    case "auth/too-many-requests":
      return "Muitas tentativas de login. Tente novamente mais tarde.";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet e tente novamente.";
    default:
      return `Erro de login: ${errorCode}`;
  }
};

export const getFirebaseRegistrationErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Este email já está cadastrado. Tente fazer login.";
    case "auth/invalid-email":
      return "Formato de email inválido. Verifique e tente novamente.";
    case "auth/weak-password":
      return "Senha muito fraca. Use pelo menos 6 caracteres com letras e números.";
    case "auth/operation-not-allowed":
      return "Cadastro está desativado no momento. Tente novamente mais tarde.";
    case "auth/network-request-failed":
      return "Erro de rede. Verifique sua conexão com a internet.";
    default:
      return `Erro de cadastro: ${errorCode}`;
  }
};

export const getFirebasePasswordResetErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Email inválido. Verifique o formato.";
    case "auth/user-not-found":
      return "Nenhum usuário encontrado com este email.";
    case "auth/too-many-requests":
      return "Muitas solicitações. Tente novamente mais tarde.";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet e tente novamente.";
    default:
      return `Erro ao redefinir senha: ${errorCode}`;
  }
};