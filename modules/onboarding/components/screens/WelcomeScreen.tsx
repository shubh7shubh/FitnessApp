// src/features/onboarding/screens/WelcomeScreen.tsx

import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export const WelcomeScreen = () => {
  const isDark = useColorScheme() === "dark";

  return (
    <View className="flex-1 justify-center items-center px-6">
      <Animated.View
        entering={FadeInUp.duration(600).delay(200)}
        className="items-center"
      >
        <LinearGradient
          colors={isDark ? ["#1E293B", "#0F172A"] : ["#ECFDF5", "#D1FAE5"]}
          style={{
            width: 132,
            height: 132,
            borderRadius: 66,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <Feather name="zap" size={56} color="#10B981" />
        </LinearGradient>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(400)}
        className="items-center mb-6"
      >
        <Text className="text-4xl font-bold text-gray-800 dark:text-white text-center">
          Welcome to FitNext!
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(600)}
        className="items-center"
      >
        <Text className="text-xl text-gray-500 dark:text-gray-400 text-center leading-7">
          Let's create a personalized plan to help you reach your fitness goals
          and build healthy habits.
        </Text>
      </Animated.View>
    </View>
  );
};
