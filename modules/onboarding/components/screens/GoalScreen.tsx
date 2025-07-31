import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const GOALS = [
  {
    key: "lose_weight",
    title: "Lose Weight",
    description:
      "Reduce body weight through caloric deficit",
    emoji: "📉",
  },
  {
    key: "maintain_weight",
    title: "Maintain Weight",
    description:
      "Maintain current weight and build healthy habits",
    emoji: "⚖️",
  },
  {
    key: "gain_muscle",
    title: "Gain Muscle",
    description:
      "Build muscle mass through strength training",
    emoji: "💪",
  },
];

interface GoalCardProps {
  title: string;
  description: string;
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
  isDark: boolean;
}

const GoalCard = ({
  title,
  description,
  emoji,
  isSelected,
  onPress,
  isDark,
}: GoalCardProps) => (
  <Pressable
    onPress={onPress}
    className={`border-2 p-6 rounded-2xl mb-4 mx-5 shadow-lg ${
      isSelected
        ? isDark
          ? "border-violet-500 bg-violet-500/20"
          : "border-pink-400 bg-pink-400/20"
        : isDark
          ? "border-gray-600 bg-gray-800/50"
          : "border-gray-300 bg-white/80"
    }`}
    style={{
      shadowColor: isSelected
        ? isDark
          ? "#8B5CF6"
          : "#F472B6"
        : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isSelected ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: isSelected ? 8 : 4,
    }}
  >
    <View className="flex-row items-center mb-3">
      <Text className="text-3xl mr-4">{emoji}</Text>
      <Text
        className={`text-xl font-bold ${
          isSelected
            ? isDark
              ? "text-violet-300"
              : "text-pink-600"
            : isDark
              ? "text-gray-200"
              : "text-gray-800"
        }`}
      >
        {title}
      </Text>
    </View>
    <Text
      className={`text-sm ml-12 leading-5 ${
        isDark ? "text-gray-400" : "text-gray-600"
      }`}
    >
      {description}
    </Text>
  </Pressable>
);

interface GoalScreenProps {
  onGoalSelect?: (goal: string) => void;
}

export const GoalScreen = ({
  onGoalSelect,
}: GoalScreenProps) => {
  const isDark = useColorScheme() === "dark";
  const [selectedGoal, setSelectedGoal] =
    useState("lose_weight");

  const handleGoalSelect = (goalKey: string) => {
    setSelectedGoal(goalKey);
    onGoalSelect?.(goalKey);
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? ["#0F0F23", "#1A1A2E", "#16213E"]
          : ["#FFFFFF", "#FDEDF3", "#F9E7F7"]
      }
      className="flex-1"
    >
      <View className="flex-1 justify-center pt-[100px] pb-20">
        {/* Header */}
        <View className="items-center px-5 mb-12">
          <Text className="text-lg text-gray-500 dark:text-gray-400 tracking-wide mb-2">
            Choose your
          </Text>
          <Text className="text-[32px] font-bold text-gray-800 dark:text-gray-50 text-center leading-tight tracking-wide">
            Fitness Goal
          </Text>
          <Text className="text-base text-gray-600 dark:text-gray-400 text-center mt-4 px-8 leading-6">
            This will help us tailor your experience and
            create a personalized plan.
          </Text>
        </View>

        {/* Goal Cards */}
        <View className="flex-1">
          {GOALS.map((goal) => (
            <GoalCard
              key={goal.key}
              title={goal.title}
              description={goal.description}
              emoji={goal.emoji}
              isSelected={selectedGoal === goal.key}
              onPress={() => handleGoalSelect(goal.key)}
              isDark={isDark}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};
