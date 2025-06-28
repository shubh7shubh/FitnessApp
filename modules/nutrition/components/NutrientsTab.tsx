import {
  View,
  Text,
  useColorScheme,
  ScrollView,
} from "react-native";
import React, { useMemo } from "react";
import withObservables from "@nozbe/with-observables";
import { Q } from "@nozbe/watermelondb";
import { database } from "@/db/index";
import { DiaryEntry } from "@/db/models/DiaryEntry";
import { useAppStore } from "@/stores/appStore";
import { COLORS } from "@/constants/theme";

interface NutrientsTabProps {
  dateString: string;
}

interface ObservableProps {
  diaryEntries: DiaryEntry[];
}

interface NutrientRowProps {
  label: string;
  total: number;
  goal: number;
  color: string;
  unit?: string;
}

const NutrientRow = ({
  label,
  total,
  goal,
  color,
  unit = "g",
}: NutrientRowProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const remaining = Math.max(0, goal - total);
  const percentage =
    goal > 0 ? Math.min(100, (total / goal) * 100) : 0;

  return (
    <View
      style={{
        marginBottom: 24,
      }}
    >
      {/* Header row with values */}
      <View className="flex-row items-center justify-between mb-3">
        <Text
          style={{ color: colors.text.primary }}
          className="text-lg font-medium"
        >
          {label}
        </Text>
        <View className="flex-row items-center">
          <Text
            style={{ color: colors.text.primary }}
            className="text-base mr-8"
          >
            {Math.round(total)}
          </Text>
          <Text
            style={{ color: colors.text.primary }}
            className="text-base mr-8"
          >
            {goal}
          </Text>
          <Text
            style={{ color: colors.text.primary }}
            className="text-base font-medium"
          >
            {remaining} {unit}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 6,
          backgroundColor: colors.surfaceElevated,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 6,
            backgroundColor: color,
            borderRadius: 3,
            width: `${Math.min(100, percentage)}%`,
          }}
        />
      </View>
    </View>
  );
};

const BaseNutrientsTab = ({
  dateString,
  diaryEntries,
}: NutrientsTabProps & ObservableProps) => {
  const { currentUser } = useAppStore();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  // Memoize calculations to prevent unnecessary re-renders
  const { totals, goals, isEmpty } = useMemo(() => {
    // Calculate totals from diary entries
    const totals = diaryEntries.reduce(
      (acc, entry) => ({
        protein: acc.protein + (entry.protein_g || 0),
        carbs: acc.carbs + (entry.carbs_g || 0),
        fiber: acc.fiber + (entry.fiber_g || 0),
      }),
      { protein: 0, carbs: 0, fiber: 0 }
    );

    // Get user's nutrition goals
    const goals = {
      protein: currentUser?.proteinGoal_g || 150,
      carbs: currentUser?.carbsGoal_g || 200,
      fiber: currentUser?.fiberGoal_g || 25,
    };

    const isEmpty =
      totals.protein === 0 &&
      totals.carbs === 0 &&
      totals.fiber === 0;

    return { totals, goals, isEmpty };
  }, [diaryEntries, currentUser]);

  // Show empty state immediately
  if (isEmpty) {
    return (
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 32,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
            margin: 16,
          }}
        >
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 16,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            No nutrition data yet{"\n"}
            Add foods to your diary to track nutrients
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-6">
        <Text
          style={{ color: colors.text.primary }}
          className="text-lg font-medium"
        ></Text>
        <View className="flex-row items-center">
          <Text
            style={{ color: colors.text.primary }}
            className="text-base font-medium mr-8"
          >
            Total
          </Text>
          <Text
            style={{ color: colors.text.primary }}
            className="text-base font-medium mr-8"
          >
            Goal
          </Text>
          <Text
            style={{ color: colors.text.primary }}
            className="text-base font-medium"
          >
            Left
          </Text>
        </View>
      </View>

      {/* Nutrient Cards */}
      <View>
        <NutrientRow
          label="Protein"
          total={totals.protein}
          goal={goals.protein}
          color="#FF6B35"
        />

        <NutrientRow
          label="Carbohydrates"
          total={totals.carbs}
          goal={goals.carbs}
          color="#4ECDC4"
        />

        <NutrientRow
          label="Fiber"
          total={totals.fiber}
          goal={goals.fiber}
          color="#9B59B6"
        />
      </View>
    </ScrollView>
  );
};

// Simplified export - remove React.memo wrapping for now
export const NutrientsTab = withObservables(
  ["dateString"],
  ({ dateString }: NutrientsTabProps) => ({
    diaryEntries: database.collections
      .get<DiaryEntry>("diary_entries")
      .query(Q.where("date", dateString)),
  })
)(BaseNutrientsTab);
