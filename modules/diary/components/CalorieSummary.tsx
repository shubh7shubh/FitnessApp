import { View, Text, useColorScheme } from "react-native";
import React from "react";
import { useDiaryStore } from "@/modules/diary/store/useDiaryStore";
import { useHomeStore } from "@/modules/home/store/homeStore";
import { isToday, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FITNESS_COLORS } from "@/constants/theme";

interface CalorieSummaryProps {
  dateString: string;
}

const CalorieSummary = ({ dateString }: CalorieSummaryProps) => {
  const { getDiaryForDate, getTotalCaloriesBurnedForDate } = useDiaryStore();
  const { todayStats } = useHomeStore();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const diary = getDiaryForDate(dateString);
  const isCurrentDay = isToday(parseISO(dateString));

  // Calculate total calories consumed from diary entries
  const caloriesConsumed = diary.meals.reduce(
    (total, meal) =>
      total +
      meal.items.reduce((mealTotal, item) => mealTotal + item.calories, 0),
    0
  );

  // Calculate calories burned from diary exercises
  const diaryCaloriesBurned = getTotalCaloriesBurnedForDate(dateString);

  // Use diary exercise data, or fall back to today's stats for current day
  const caloriesGoal = isCurrentDay ? todayStats.caloriesGoal : 2000;
  const caloriesBurned =
    diaryCaloriesBurned > 0
      ? diaryCaloriesBurned
      : isCurrentDay
        ? todayStats.caloriesBurned
        : 0;

  const remaining = caloriesGoal - caloriesConsumed + caloriesBurned;
  const progress = Math.min((caloriesConsumed / caloriesGoal) * 100, 100);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 16,
        zIndex: 9,
      }}
      className="shadow-sm"
    >
      {/* MyFitnessPal Style Header */}
      <Text
        style={{ color: colors.text.secondary }}
        className="text-sm font-medium mb-3"
      >
        Calories Remaining
      </Text>

      {/* MyFitnessPal Style Equation */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="items-center">
          <Text
            style={{ color: colors.text.primary }}
            className="text-2xl font-bold"
          >
            {caloriesGoal.toLocaleString()}
          </Text>
          <Text
            style={{ color: colors.text.secondary }}
            className="text-xs mt-1"
          >
            Goal
          </Text>
        </View>

        <Text style={{ color: colors.text.secondary }} className="text-xl mx-3">
          -
        </Text>

        <View className="items-center">
          <Text
            style={{ color: colors.text.primary }}
            className="text-2xl font-bold"
          >
            {Math.round(caloriesConsumed).toLocaleString()}
          </Text>
          <Text
            style={{ color: colors.text.secondary }}
            className="text-xs mt-1"
          >
            Food
          </Text>
        </View>

        <Text style={{ color: colors.text.secondary }} className="text-xl mx-3">
          +
        </Text>

        <View className="items-center">
          <Text
            style={{ color: colors.text.primary }}
            className="text-2xl font-bold"
          >
            {caloriesBurned.toLocaleString()}
          </Text>
          <Text
            style={{ color: colors.text.secondary }}
            className="text-xs mt-1"
          >
            Exercise
          </Text>
        </View>

        <Text style={{ color: colors.text.secondary }} className="text-xl mx-3">
          =
        </Text>

        <View className="items-center">
          <Text
            style={{
              color:
                remaining >= 0 ? colors.status.success : colors.status.error,
            }}
            className="text-2xl font-bold"
          >
            {Math.abs(remaining).toLocaleString()}
          </Text>
          <Text
            style={{ color: colors.text.secondary }}
            className="text-xs mt-1"
          >
            Remaining
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CalorieSummary;
