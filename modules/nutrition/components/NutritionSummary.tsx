import { View, Text, useColorScheme, ActivityIndicator } from "react-native";
import React from "react";
import withObservables from "@nozbe/with-observables";
import { Q } from "@nozbe/watermelondb";
import { database } from "@/db/index";
import { DiaryEntry } from "@/db/models/DiaryEntry";
import { useAppStore } from "@/stores/appStore";
import { isToday, parseISO } from "date-fns";
import { COLORS } from "@/constants/theme";

interface NutritionSummaryProps {
  dateString: string;
}

interface ObservableProps {
  diaryEntries: DiaryEntry[];
}

interface NutrientRowProps {
  label: string;
  total: number;
  goal: number;
  unit: string;
  color: string;
  isLoading?: boolean;
}

const NutrientRow: React.FC<NutrientRowProps> = ({
  label,
  total,
  goal,
  unit,
  color,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const remaining = Math.max(0, goal - total);
  const percentage = goal > 0 ? Math.min(100, (total / goal) * 100) : 0;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Header with nutrient name and progress bar */}
      <View className="flex-row items-center justify-between mb-3">
        <Text
          style={{ color: colors.text.primary }}
          className="text-lg font-semibold"
        >
          {label}
        </Text>
        <Text style={{ color: colors.text.secondary }} className="text-sm">
          {percentage.toFixed(0)}%
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 8,
          backgroundColor: colors.surfaceElevated,
          borderRadius: 4,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            height: 8,
            backgroundColor: color,
            borderRadius: 4,
            width: `${percentage}%`,
          }}
        />
      </View>

      {/* Numbers row */}
      {isLoading ? (
        <View className="flex-row items-center justify-center py-8">
          <ActivityIndicator size="small" color={color} />
          <Text
            style={{ color: colors.text.secondary }}
            className="ml-2 text-sm"
          >
            Loading {label.toLowerCase()}...
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <View className="items-center flex-1">
            <Text
              style={{ color: colors.text.primary }}
              className="text-2xl font-bold"
            >
              {Math.round(total).toLocaleString()}
            </Text>
            <Text
              style={{ color: colors.text.secondary }}
              className="text-xs mt-1"
            >
              Total
            </Text>
          </View>

          <Text
            style={{ color: colors.text.secondary }}
            className="text-xl mx-3"
          >
            /
          </Text>

          <View className="items-center flex-1">
            <Text
              style={{ color: colors.text.primary }}
              className="text-2xl font-bold"
            >
              {goal.toLocaleString()}
            </Text>
            <Text
              style={{ color: colors.text.secondary }}
              className="text-xs mt-1"
            >
              Goal
            </Text>
          </View>

          <Text
            style={{ color: colors.text.secondary }}
            className="text-xl mx-3"
          >
            =
          </Text>

          <View className="items-center flex-1">
            <Text
              style={{
                color:
                  remaining > 0 ? colors.status.warning : colors.status.success,
              }}
              className="text-2xl font-bold"
            >
              {remaining.toLocaleString()}
            </Text>
            <Text
              style={{ color: colors.text.secondary }}
              className="text-xs mt-1"
            >
              Left
            </Text>
          </View>
        </View>
      )}

      {/* Unit label */}
      <Text
        style={{ color: colors.text.secondary }}
        className="text-center text-sm mt-2"
      >
        {unit}
      </Text>
    </View>
  );
};

const BaseNutritionSummary = ({
  dateString,
  diaryEntries,
}: NutritionSummaryProps & ObservableProps) => {
  const { currentUser } = useAppStore();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const isCurrentDay = isToday(parseISO(dateString));

  // Show loading state for the first few moments after component mounts
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Show loading for 500ms

    return () => clearTimeout(timer);
  }, [dateString]); // Reset loading when date changes

  // Calculate totals from diary entries
  const totals = diaryEntries.reduce(
    (acc, entry) => ({
      protein: acc.protein + entry.protein_g,
      carbs: acc.carbs + entry.carbs_g,
      fiber: acc.fiber + entry.fiber_g,
    }),
    { protein: 0, carbs: 0, fiber: 0 }
  );

  // Get user's nutrition goals from their profile
  const proteinGoal = currentUser?.proteinGoal_g || 150;
  const carbsGoal = currentUser?.carbsGoal_g || 200;
  const fiberGoal = currentUser?.fiberGoal_g || 25;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View className="mb-6">
        <Text
          style={{ color: colors.text.primary }}
          className="text-2xl font-bold mb-2"
        >
          Nutrients
        </Text>
        <Text style={{ color: colors.text.secondary }} className="text-base">
          {isCurrentDay
            ? "Today's nutrition breakdown"
            : `Nutrition for ${dateString}`}
        </Text>
      </View>

      {/* Nutrient breakdown */}
      <View>
        <NutrientRow
          label="Protein"
          total={totals.protein}
          goal={proteinGoal}
          unit="grams"
          color="#FF9500" // Orange for protein
          isLoading={isLoading}
        />

        <NutrientRow
          label="Carbohydrates"
          total={totals.carbs}
          goal={carbsGoal}
          unit="grams"
          color="#34C759" // Green for carbs
          isLoading={isLoading}
        />

        <NutrientRow
          label="Fiber"
          total={totals.fiber}
          goal={fiberGoal}
          unit="grams"
          color="#6366F1" // Purple for fiber
          isLoading={isLoading}
        />
      </View>

      {/* Summary message */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginTop: 12,
        }}
      >
        <Text
          style={{ color: colors.text.secondary }}
          className="text-center text-sm"
        >
          Need more nutrition data? Add more foods to your diary to get detailed
          insights.
        </Text>
      </View>
    </View>
  );
};

// Enhanced component with observables
export const NutritionSummary = withObservables(
  ["dateString"],
  ({ dateString }: NutritionSummaryProps) => {
    const currentUser = useAppStore.getState().currentUser;

    if (!currentUser) {
      return { diaryEntries: [] };
    }

    return {
      diaryEntries: database.collections
        .get<DiaryEntry>("diary_entries")
        .query(Q.where("date", dateString), Q.where("user_id", currentUser.id))
        .observe(),
    };
  }
)(BaseNutritionSummary);
