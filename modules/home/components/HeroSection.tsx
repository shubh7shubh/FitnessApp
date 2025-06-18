import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { useHomeStore } from "../store/homeStore";
import { MacroProgress } from "../types";

export const HeroSection: React.FC = () => {
  const { colors, fitnessColors, isDark } = useTheme();
  const { todayStats } = useHomeStore();

  // Calculate calorie progress
  const caloriesRemaining =
    todayStats.caloriesGoal -
    todayStats.caloriesConsumed +
    todayStats.caloriesBurned;
  const calorieProgress =
    (todayStats.caloriesConsumed / todayStats.caloriesGoal) * 100;

  // Calculate macro progress
  const macros: MacroProgress[] = [
    {
      current: todayStats.proteinConsumed,
      goal: todayStats.proteinGoal,
      percentage: (todayStats.proteinConsumed / todayStats.proteinGoal) * 100,
      color: fitnessColors.protein,
    },
    {
      current: todayStats.carbsConsumed,
      goal: todayStats.carbsGoal,
      percentage: (todayStats.carbsConsumed / todayStats.carbsGoal) * 100,
      color: fitnessColors.carbs,
    },
    {
      current: todayStats.fatConsumed,
      goal: todayStats.fatGoal,
      percentage: (todayStats.fatConsumed / todayStats.fatGoal) * 100,
      color: fitnessColors.fat,
    },
  ];

  return (
    <View
      className="mx-4 my-3 p-4 rounded-2xl"
      style={{ backgroundColor: colors.surface }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text
            className="text-lg font-jetbrains-mono font-semibold"
            style={{ color: colors.text.primary }}
          >
            Today's Progress
          </Text>
          <Text className="text-sm" style={{ color: colors.text.secondary }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Calorie Summary */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {todayStats.caloriesConsumed.toLocaleString()}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="flame" size={16} color={fitnessColors.calories} />
            <Text
              className="text-sm ml-1"
              style={{ color: colors.text.secondary }}
            >
              {todayStats.caloriesBurned} burned
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm" style={{ color: colors.text.secondary }}>
            of {todayStats.caloriesGoal.toLocaleString()} goal
          </Text>
          <Text
            className="text-sm font-medium"
            style={{
              color:
                caloriesRemaining > 0 ? colors.primary : colors.status.warning,
            }}
          >
            {Math.abs(caloriesRemaining)}{" "}
            {caloriesRemaining > 0 ? "remaining" : "over"}
          </Text>
        </View>

        {/* Progress Bar */}
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(calorieProgress, 100)}%`,
              backgroundColor:
                calorieProgress <= 100 ? colors.primary : colors.status.warning,
            }}
          />
        </View>
      </View>

      {/* Macro Breakdown */}
      <View className="flex-row justify-between">
        {macros.map((macro, index) => (
          <View key={index} className="flex-1 items-center">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: macro.color + "20" }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: macro.color }}
              >
                {Math.round(macro.percentage)}%
              </Text>
            </View>
            <Text
              className="text-xs font-medium"
              style={{ color: colors.text.primary }}
            >
              {macro.current}g
            </Text>
            <Text className="text-xs" style={{ color: colors.text.muted }}>
              {index === 0 ? "Protein" : index === 1 ? "Carbs" : "Fat"}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Stats Row */}
      <View
        className="flex-row justify-between mt-4 pt-4"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <View className="flex-row items-center">
          <Ionicons name="walk" size={16} color={fitnessColors.steps} />
          <Text
            className="text-sm ml-2"
            style={{ color: colors.text.secondary }}
          >
            {todayStats.stepsCount.toLocaleString()} steps
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="water" size={16} color={fitnessColors.water} />
          <Text
            className="text-sm ml-2"
            style={{ color: colors.text.secondary }}
          >
            {(todayStats.waterConsumed / 1000).toFixed(1)}L water
          </Text>
        </View>
      </View>
    </View>
  );
};
