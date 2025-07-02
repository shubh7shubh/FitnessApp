import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";

const GOALS = [
  {
    key: "lose_weight",
    title: "Lose Weight",
    description: "Reduce body weight through caloric deficit",
    emoji: "📉",
  },
  {
    key: "maintain_weight",
    title: "Maintain Weight",
    description: "Maintain current weight and build healthy habits",
    emoji: "⚖️",
  },
  {
    key: "gain_muscle",
    title: "Gain Muscle",
    description: "Build muscle mass through strength training",
    emoji: "💪",
  },
];

interface GoalCardProps {
  title: string;
  description: string;
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
}

const GoalCard = ({
  title,
  description,
  emoji,
  isSelected,
  onPress,
}: GoalCardProps) => (
  <Pressable
    onPress={onPress}
    className={`border-2 p-6 rounded-2xl mb-4 ${
      isSelected ? "border-green-500 bg-green-500/10" : "border-gray-700"
    }`}
  >
    <View className="flex-row items-center mb-2">
      <Text className="text-2xl mr-4">{emoji}</Text>
      <Text
        className={`text-lg font-semibold ${
          isSelected ? "text-white" : "text-gray-300"
        }`}
      >
        {title}
      </Text>
    </View>
    <Text className="text-gray-400 text-sm ml-10">{description}</Text>
  </Pressable>
);

interface GoalScreenProps {
  onGoalSelect?: (goal: string) => void;
}

export const GoalScreen = ({ onGoalSelect }: GoalScreenProps) => {
  const [selectedGoal, setSelectedGoal] = useState("lose_weight");

  const handleGoalSelect = (goalKey: string) => {
    setSelectedGoal(goalKey);
    onGoalSelect?.(goalKey);
  };

  return (
    <View className="flex-1 justify-center">
      <Text className="text-white text-3xl font-bold text-center mb-2">
        What's Your Goal?
      </Text>
      <Text className="text-gray-400 text-base text-center mb-8">
        This will help us tailor your experience.
      </Text>

      {GOALS.map((goal) => (
        <GoalCard
          key={goal.key}
          title={goal.title}
          description={goal.description}
          emoji={goal.emoji}
          isSelected={selectedGoal === goal.key}
          onPress={() => handleGoalSelect(goal.key)}
        />
      ))}
    </View>
  );
};
