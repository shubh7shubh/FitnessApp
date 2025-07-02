import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";

export default function Index() {
  // Add logging to help debug
  useEffect(() => {
    console.log("📍 Index screen mounted");
    return () => {
      console.log("📍 Index screen unmounted");
    };
  }, []);

  // This is the initial screen that shows while _layout.tsx determines where to navigate
  // The _layout.tsx will handle all the navigation logic
  return (
    <View className="flex-1 bg-black justify-center items-center">
      <ActivityIndicator size="large" color="#10B981" />
      <Text className="text-white mt-4">Starting FitNext...</Text>
      <Text className="text-gray-400 mt-2 text-sm">
        Checking your profile...
      </Text>
    </View>
  );
}
