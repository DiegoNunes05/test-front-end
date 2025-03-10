import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import {router} from "expo-router";
import AppIntroSlider from "react-native-app-intro-slider";
import {Ionicons} from "@expo/vector-icons";

const {width, height} = Dimensions.get("window");

interface Slide {
  key: string;
  title: string;
  text: string;
  imageUrl: string;
  backgroundColor: string;
}

const slides: Slide[] = [
  {
    key: "gerenciamento_cargas",
    title: "Gestão de Cargas",
    text: "Visualize todas as suas cargas disponíveis, filtre e busque por região ou tipo de carga. Acesse detalhes completos e trajetos no mapa.",
    imageUrl:
      "https://res.cloudinary.com/dnukxp5ng/image/upload/v1741353477/caixas_pst2b7.png",
    backgroundColor: "#0D47A1",
  },
  {
    key: "documentos",
    title: "Captura de Documentos",
    text: "Capture e envie imagens de documentos diretamente pelo app. Registre conhecimentos de carga, comprovantes de entrega e outros documentos necessários.",
    imageUrl:
      "https://res.cloudinary.com/dnukxp5ng/image/upload/v1741353606/licenciamento_lthg91.png",
    backgroundColor: "#0D47A1",
  },
  {
    key: "chat",
    title: "Chat em Tempo Real",
    text: "Comunique-se diretamente com o suporte e despachantes por mensagens. Receba atualizações e instruções durante seu trajeto.",
    imageUrl:
      "https://res.cloudinary.com/dnukxp5ng/image/upload/v1741354000/mensagens_sdnpkp.png",
    backgroundColor: "#0D47A1",
  },
  {
    key: "notificacoes",
    title: "Notificações Importantes",
    text: "Receba alertas sobre novas cargas, alterações de rota e mensagens do suporte, mesmo quando o app estiver em segundo plano.",
    imageUrl:
      "https://res.cloudinary.com/dnukxp5ng/image/upload/v1741354041/packard-bell_inuwom.png",
    backgroundColor: "#0D47A1",
  },
  {
    key: "perfil",
    title: "Gerenciamento de Perfil",
    text: "Mantenha seus dados atualizados, gerencie suas preferências e acompanhe seu histórico de entregas em um só lugar.",
    imageUrl:
      "https://res.cloudinary.com/dnukxp5ng/image/upload/v1741354094/cara_vdgovx.png",
    backgroundColor: "#0D47A1",
  },
];

export default function OnboardingScreen() {
  const handleDone = () => {
    router.replace("/(public)/login");
  };

  const handleSkip = () => {
    router.replace("/(public)/login");
  };

  const renderItem = ({item}: {item: Slide}) => {
    return (
      <View style={[styles.slide, {backgroundColor: item.backgroundColor}]}>
        <View style={styles.iconContainer}>
          <Image
            source={{uri: item.imageUrl}}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
      </View>
    );
  };

  const renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons name="checkmark" size={24} color="#FFFFFF" />
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Fazer Login</Text>
      </TouchableOpacity>

      <AppIntroSlider
        data={slides}
        renderItem={renderItem}
        onDone={handleDone}
        renderDoneButton={renderDoneButton}
        renderNextButton={renderNextButton}
        dotStyle={styles.dotStyle}
        activeDotStyle={styles.activeDotStyle}
        showPrevButton={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 40,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    paddingHorizontal: 20,
    maxWidth: 400,
  },
  buttonCircle: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0, 0, 0, .1)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  dotStyle: {
    backgroundColor: "rgba(255, 255, 255, .5)",
  },
  activeDotStyle: {
    backgroundColor: "white",
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "android" ? 30 : 60,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, .1)",
    borderRadius: 8,
    zIndex: 1000,
  },
  skipButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
