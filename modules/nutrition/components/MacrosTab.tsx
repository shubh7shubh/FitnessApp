import { View, Text, useColorScheme } from "react-native";
import React, { useMemo } from "react";
import withObservables from "@nozbe/with-observables";
import { Q } from "@nozbe/watermelondb";
import { database } from "@/db/index";
import { DiaryEntry } from "@/db/models/DiaryEntry";
import { useAppStore } from "@/stores/appStore";
import { COLORS } from "@/constants/theme";
import { PieChart } from "react-native-gifted-charts";

interface MacrosTabProps {
  dateString: string;
}

interface ObservableProps {
  diaryEntries: DiaryEntry[];
}

const BaseMacrosTab = ({
  dateString,
  diaryEntries,
}: MacrosTabProps & ObservableProps) => {
  const { currentUser } = useAppStore();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  // Memoize calculations to prevent unnecessary re-renders
  const { pieData, macroBreakdown, totalMacros } =
    useMemo(() => {
      // Calculate macro totals
      const totals = diaryEntries.reduce(
        (acc, entry) => ({
          protein: acc.protein + entry.protein_g,
          carbs: acc.carbs + entry.carbs_g,
          fat: acc.fat + entry.fat_g,
        }),
        { protein: 0, carbs: 0, fat: 0 }
      );

      // Get user's macro goals
      const proteinGoal = currentUser?.proteinGoal_g || 150;
      const carbsGoal = currentUser?.carbsGoal_g || 200;
      const fatGoal = currentUser?.fatGoal_g || 70;

      const totalMacros =
        totals.protein + totals.carbs + totals.fat;

      // Prepare data for PieChart
      const pieData =
        totalMacros > 0
          ? [
              {
                value: totals.carbs,
                color: "#1ABC9C", // Teal/Turquoise like in your image
                text: `${Math.round((totals.carbs / totalMacros) * 100)}%`,
                textColor: "black",
                textSize: 12,
                fontWeight: "bold",
              },
              {
                value: totals.fat,
                color: "#9B59B6", // Purple like in your image
                text: `${Math.round((totals.fat / totalMacros) * 100)}%`,
                textColor: "black",
                textSize: 12,
                fontWeight: "bold",
              },
              {
                value: totals.protein,
                color: "#F39C12", // Orange like in your image
                text: `${Math.round((totals.protein / totalMacros) * 100)}%`,
                textColor: "black",
                textSize: 12,
                fontWeight: "bold",
              },
            ].filter((item) => item.value > 0)
          : [];

      // Prepare breakdown data
      const macroBreakdown = [
        {
          name: "Carbohydrates",
          amount: totals.carbs,
          percentage:
            totalMacros > 0
              ? (totals.carbs / totalMacros) * 100
              : 0,
          goalPercentage: (totals.carbs / carbsGoal) * 100,
          color: "#1ABC9C", // Matching the pie chart color
          unit: "g",
        },
        {
          name: "Fat",
          amount: totals.fat,
          percentage:
            totalMacros > 0
              ? (totals.fat / totalMacros) * 100
              : 0,
          goalPercentage: (totals.fat / fatGoal) * 100,
          color: "#9B59B6", // Matching the pie chart color
          unit: "g",
        },
        {
          name: "Protein",
          amount: totals.protein,
          percentage:
            totalMacros > 0
              ? (totals.protein / totalMacros) * 100
              : 0,
          goalPercentage:
            (totals.protein / proteinGoal) * 100,
          color: "#F39C12", // Matching the pie chart color
          unit: "g",
        },
      ].filter((macro) => macro.amount > 0);

      return { pieData, macroBreakdown, totalMacros };
    }, [diaryEntries, currentUser]);

  // Early return for empty state
  if (totalMacros === 0) {
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
            No macros logged for this day
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
        <View
          style={{ alignItems: "center", marginBottom: 20 }}
        >
          <PieChart
            data={pieData}
            radius={80}
            innerRadius={0}
            strokeWidth={2}
            strokeColor={colors.background}
            isAnimated
            animationDuration={800}
            showText
            textColor="black"
            textSize={16}
            fontWeight="bold"
            showTextBackground={false}
          />
        </View>

        {/* Macro breakdown with Total and Goal columns */}
        <View style={{ width: "100%" }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1" />
            <Text
              style={{ color: colors.text.secondary }}
              className="text-sm font-medium w-16 text-center"
            >
              Total
            </Text>
            <Text
              style={{ color: colors.text.secondary }}
              className="text-sm font-medium w-16 text-center"
            >
              Goal
            </Text>
          </View>

          {/* Macro rows */}
          {macroBreakdown.map((macro) => (
            <View
              key={macro.name}
              className="flex-row items-center justify-between mb-4"
            >
              <View className="flex-row items-center flex-1">
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: macro.color,
                    marginRight: 12,
                  }}
                />
                <View>
                  <Text
                    style={{ color: colors.text.primary }}
                    className="text-base font-medium"
                  >
                    {macro.name} ({Math.round(macro.amount)}
                    {macro.unit})
                  </Text>
                </View>
              </View>

              <Text
                style={{ color: colors.text.primary }}
                className="text-sm font-semibold w-16 text-center"
              >
                {macro.percentage.toFixed(0)}%
              </Text>

              <Text
                style={{ color: "#007AFF" }}
                className="text-sm font-semibold w-16 text-center"
              >
                {Math.min(
                  100,
                  macro.goalPercentage
                ).toFixed(0)}
                %
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Optimized component with observables and memoization
export const MacrosTab = React.memo(
  withObservables(
    ["dateString"],
    ({ dateString }: MacrosTabProps) => ({
      diaryEntries: database.collections
        .get<DiaryEntry>("diary_entries")
        .query(Q.where("date", dateString)),
    })
  )(BaseMacrosTab)
);

// Add display name for debugging
MacrosTab.displayName = "MacrosTab";
