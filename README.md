# Billor Driver App 📱

## Sobre o Projeto
Aplicativo móvel para motoristas de transporte de cargas, desenvolvido com React Native e Expo.

## 🚀 Tecnologias Utilizadas
- React Native
- Expo
- TypeScript
- Firebase Authentication
- Firestore
- React Navigation

## 🔧 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou Yarn
- Expo CLI

### Passos de Instalação

1. Clone o repositório
```bash
git clone https://github.seu-usuario/billor-driver-app.git
```

2. Instale as dependências
```bash
cd billor-driver-app
npm install # ou yarn install
```

3. Configure as variáveis de ambiente

#### Configurando a URL da API Local Para Desenvolvimento com JSON Server

Descubra o IP da sua máquina local:
- Windows: Abra o Prompt de Comando e digite `ipconfig`
- Mac/Linux: Abra o Terminal e digite `ifconfig` ou `ip addr`
- Localize o endereço IP da sua rede local (geralmente começa com 192.168.x.x)
- Adicione ao seu .env:
```
API_URL=http://SEU_IP_LOCAL:3000  json-server --watch db.json --port 3000 para rodar o db.json
```

#### Exemplo Completo de .env
```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAbc123DefG456HijK789LmnO
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456ghi
API_URL=http://192.168.1.2:3000
```

#### Notas Importantes
- Nunca compartilhe seu arquivo .env publicamente
- Adicione .env ao seu .gitignore
- Para projetos em equipe, crie um .env.example com a estrutura, mas sem valores reais

4. Inicie o projeto
```bash
npx expo start
```

## 📂 Estrutura do Projeto
```
billor-driver-app/
│ 
├── app/               # Páginas e rotas
│   ├── (auth)/        # Rotas autenticadas
│   └── (public)/      # Rotas públicas
│ 
├── components/        # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── ChatButton.tsx
│   └── ...
│ 
├── contexts/          # Gerenciamento de estado global
│   ├── AuthContext.tsx
│   ├── ChatContext.tsx
│   └── ...
│ 
├── hooks/             # Hooks personalizados
│   └── useAuth.ts
│ 
├── services/          # Serviços de API
│   ├── api.ts
│   └── authService.ts
│ 
├── types/             # Definições de tipos
│   └── types.ts
│ 
└── utils/             # Utilitários
    └── firebaseErrorMessage.ts
```

## 🤝 Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça um Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## 📞 Contato
Diego Nunes - diegonunesabc@gmail.com

Link do Projeto: [https://github.com/DiegoNunes05/billor-driver-app](https://github.com/DiegoNunes05/Billor-driver-app)

Desenvolvido com por [Diego Nunes](https://github.com/DiegoNunes05)
