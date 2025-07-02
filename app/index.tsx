import React from "react";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  // This is the initial screen that shows while _layout.tsx determines where to navigate
  // The _layout.tsx will handle all the navigation logic
  return (
    <View className="flex-1 bg-black justify-center items-center">
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}
