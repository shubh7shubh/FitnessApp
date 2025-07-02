import React from "react";
import { View, Text } from "react-native";

export const SimpleWelcomeScreen = () => {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="w-20 h-20 bg-green-500 rounded-full justify-center items-center mb-8">
        <Text className="text-3xl">⚡</Text>
      </View>

      <Text className="text-white text-3xl font-bold text-center mb-4">
        Welcome to Fitnex
      </Text>

      <Text className="text-gray-400 text-lg text-center leading-7">
        Let's get your profile set up to create a personalized fitness journey
        just for you.
      </Text>
    </View>
  );
};
