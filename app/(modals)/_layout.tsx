import { Stack } from "expo-router";
import React from "react";

// This layout configures all screens in this group to be presentation modals.
export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: false,
      }}
    />
  );
}
