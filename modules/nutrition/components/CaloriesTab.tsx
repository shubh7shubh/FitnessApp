import { View, Text, useColorScheme } from "react-native";
import React, { useMemo } from "react";
import withObservables from "@nozbe/with-observables";
import { Q } from "@nozbe/watermelondb";
import { database } from "@/db/index";
import { DiaryEntry } from "@/db/models/DiaryEntry";
import { useAppStore } from "@/stores/appStore";
import { COLORS } from "@/constants/theme";
import { PieChart } from "react-native-gifted-charts";

interface CaloriesTabProps {
  dateString: string;
}

interface ObservableProps {
  diaryEntries: DiaryEntry[];
}

const BaseCaloriesTab = ({
  dateString,
  diaryEntries,
}: CaloriesTabProps & ObservableProps) => {
  const { currentUser } = useAppStore();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  // Memoize calculations to prevent unnecessary re-renders
  const { pieData, mealBreakdown, totalCalories, summaryData } = useMemo(() => {
    // Calculate meal totals
    const mealTotals = diaryEntries.reduce(
      (acc, entry) => {
        acc[entry.mealType] += entry.calories;
        return acc;
      },
      { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 }
    );

    const totalCalories = Object.values(mealTotals).reduce(
      (sum, cal) => sum + cal,
      0
    );

    const caloriesGoal = currentUser?.dailyCalorieGoal || 2000;
    const caloriesBurned = 0; // TODO: Add exercise tracking
    const netCalories = totalCalories - caloriesBurned;
    const remaining = caloriesGoal - netCalories;

    // Meal colors - consistent with your existing design
    const mealColors = {
      breakfast: "#FF9500", // Orange
      lunch: "#34C759", // Green
      dinner: "#007AFF", // Blue
      snacks: "#AF52DE", // Purple
    };

    // Prepare data for PieChart (same structure as MacrosTab)
    const pieData =
      totalCalories > 0
        ? [
            {
              value: mealTotals.breakfast,
              color: mealColors.breakfast,
              text: `${Math.round((mealTotals.breakfast / totalCalories) * 100)}%`,
              textColor: "black",
              textSize: 14,
              fontWeight: "bold",
            },
            {
              value: mealTotals.lunch,
              color: mealColors.lunch,
              text: `${Math.round((mealTotals.lunch / totalCalories) * 100)}%`,
              textColor: "black",
              textSize: 14,
              fontWeight: "bold",
            },
            {
              value: mealTotals.dinner,
              color: mealColors.dinner,
              text: `${Math.round((mealTotals.dinner / totalCalories) * 100)}%`,
              textColor: "black",
              textSize: 14,
              fontWeight: "bold",
            },
            {
              value: mealTotals.snacks,
              color: mealColors.snacks,
              text: `${Math.round((mealTotals.snacks / totalCalories) * 100)}%`,
              textColor: "black",
              textSize: 14,
              fontWeight: "bold",
            },
          ].filter((item) => item.value > 0)
        : [];

    // Prepare breakdown data
    const mealBreakdown = [
      {
        name: "Breakfast",
        calories: mealTotals.breakfast,
        percentage:
          totalCalories > 0 ? (mealTotals.breakfast / totalCalories) * 100 : 0,
        color: mealColors.breakfast,
      },
      {
        name: "Lunch",
        calories: mealTotals.lunch,
        percentage:
          totalCalories > 0 ? (mealTotals.lunch / totalCalories) * 100 : 0,
        color: mealColors.lunch,
      },
      {
        name: "Dinner",
        calories: mealTotals.dinner,
        percentage:
          totalCalories > 0 ? (mealTotals.dinner / totalCalories) * 100 : 0,
        color: mealColors.dinner,
      },
      {
        name: "Snacks",
        calories: mealTotals.snacks,
        percentage:
          totalCalories > 0 ? (mealTotals.snacks / totalCalories) * 100 : 0,
        color: mealColors.snacks,
      },
    ].filter((meal) => meal.calories > 0);

    const summaryData = {
      totalCalories,
      netCalories,
      caloriesGoal,
      remaining,
    };

    return {
      pieData,
      mealBreakdown,
      totalCalories,
      summaryData,
    };
  }, [diaryEntries, currentUser]);

  // Early return for empty state
  if (totalCalories === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
          }}
        >
          <Text
            style={{ color: colors.text.secondary }}
            className="text-center text-base"
          >
            No calories logged for this day
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Pie Chart Container */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        {/* Center the pie chart */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <PieChart
            data={pieData}
            radius={80} // Change this value to increase/decrease size
            innerRadius={0}
            strokeWidth={2}
            strokeColor={colors.background}
            isAnimated
            animationDuration={800}
            showText
            textColor="black"
            textSize={18}
            fontWeight="bold"
            showTextBackground={false}
          />
        </View>

        {/* Meal breakdown */}
        <View style={{ width: "100%" }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1" />
            <Text
              style={{ color: colors.text.secondary }}
              className="text-sm font-medium w-20 text-center"
            >
              Calories
            </Text>
            <Text
              style={{ color: colors.text.secondary }}
              className="text-sm font-medium w-16 text-center"
            >
              Percent
            </Text>
          </View>

          {/* Meal rows */}
          {mealBreakdown.map((meal) => (
            <View
              key={meal.name}
              className="flex-row items-center justify-between mb-4"
            >
              <View className="flex-row items-center flex-1">
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: meal.color,
                    marginRight: 12,
                  }}
                />
                <View>
                  <Text
                    style={{ color: colors.text.primary }}
                    className="text-base font-medium"
                  >
                    {meal.name}
                  </Text>
                </View>
              </View>

              <Text
                style={{ color: colors.text.primary }}
                className="text-sm font-semibold w-20 text-center"
              >
                {Math.round(meal.calories)} cal
              </Text>

              <Text
                style={{ color: "#007AFF" }}
                className="text-sm font-semibold w-16 text-center"
              >
                {meal.percentage.toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Summary Section */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text
            style={{ color: colors.text.primary }}
            className="text-lg font-semibold"
          >
            Total Calories
          </Text>
          <Text
            style={{ color: colors.text.primary }}
            className="text-xl font-bold"
          >
            {Math.round(summaryData.totalCalories)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <Text
            style={{ color: colors.text.primary }}
            className="text-lg font-semibold"
          >
            Net Calories
          </Text>
          <Text
            style={{ color: colors.text.primary }}
            className="text-xl font-bold"
          >
            {Math.round(summaryData.netCalories)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text
            style={{ color: colors.text.primary }}
            className="text-lg font-semibold"
          >
            Goal
          </Text>
          <Text style={{ color: "#007AFF" }} className="text-xl font-bold">
            {summaryData.caloriesGoal.toLocaleString()}
          </Text>
        </View>

        <View
          className="mt-4 pt-4"
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              style={{ color: colors.text.secondary }}
              className="text-base"
            >
              Remaining
            </Text>
            <Text
              style={{
                color:
                  summaryData.remaining >= 0
                    ? colors.status.success
                    : colors.status.error,
              }}
              className="text-lg font-semibold"
            >
              {Math.abs(summaryData.remaining)} cal
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Optimized component with observables and memoization
export const CaloriesTab = React.memo(
  withObservables(["dateString"], ({ dateString }: CaloriesTabProps) => ({
    diaryEntries: database.collections
      .get<DiaryEntry>("diary_entries")
      .query(Q.where("date", dateString)),
  }))(BaseCaloriesTab)
);

// Add display name for debugging
CaloriesTab.displayName = "CaloriesTab";
