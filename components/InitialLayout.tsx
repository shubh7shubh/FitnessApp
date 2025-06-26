import { Stack } from "expo-router";
import React from "react";

export default function InitialLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}></Stack>
  );
}
