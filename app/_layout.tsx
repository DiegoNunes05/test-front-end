import React, {useEffect, useState} from "react";
import {Stack} from "expo-router";
import {AuthProvider} from "../contexts/AuthContext";
import * as Font from "expo-font";
import {Ionicons} from "@expo/vector-icons";
import {View, ActivityIndicator} from "react-native";
import {ChatProvider} from "@/contexts/ChatContext";
import {NotificationProvider} from "@/contexts/NotificationContext";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn("Erro ao carregar fontes:", e);
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
        <ActivityIndicator size="large" color="#0D47A1" />
      </View>
    );
  } 
  
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="home" />
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(public)" />
          </Stack>
        </ChatProvider>
      </NotificationProvider>
      <Toast
        position="top"
        topOffset={65}
        visibilityTime={2000}
      />
    </AuthProvider>
  );
}
