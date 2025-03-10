import React, {useEffect} from "react";
import {View, ActivityIndicator, StyleSheet} from "react-native";
import {router} from "expo-router";
import {onAuthStateChanged} from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default function Index() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/(auth)/home");
      } else {
        router.replace("/onboarding");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0D47A1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
