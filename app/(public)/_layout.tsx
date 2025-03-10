// app/(public)/_layout.tsx
import React from "react";
import {Stack} from "expo-router";

export default function PublicLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
