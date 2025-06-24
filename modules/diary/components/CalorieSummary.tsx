import { View, Text, useColorScheme } from "react-native";
import React from "react";
import withObservables from "@nozbe/with-observables";
import { Q } from "@nozbe/watermelondb";
import { database } from "@/db/index";
import { DiaryEntry } from "@/db/models/DiaryEntry";
import { useAppStore } from "@/stores/appStore";
import { isToday, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FITNESS_COLORS } from "@/constants/theme";

interface CalorieSummaryProps {
  dateString: string;
}

interface ObservableProps {
  diaryEntries: DiaryEntry[];
}

const BaseCalorieSummary = ({
  dateString,
  diaryEntries,
}: CalorieSummaryProps & ObservableProps) => {
  const { currentUser } = useAppStore();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const isCurrentDay = isToday(parseISO(dateString));

  // Calculate total calories from diary entries
  const totalCalories = diaryEntries.reduce(
    (total, entry) => total + entry.calories,
    0
  );

  // Get user's daily calorie goal from their profile
  const caloriesGoal = currentUser?.dailyCalorieGoal || 2000;

  // For now, we'll use 0 for exercise calories since we don't have exercise tracking yet
  // This can be extended when exercise functionality is added
  const caloriesBurned = 0;

  const caloriesConsumed = totalCalories;
  const remaining = caloriesGoal - caloriesConsumed + caloriesBurned;

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

// Enhanced component with observables
const CalorieSummary = withObservables(
  ["dateString"],
  ({ dateString }: CalorieSummaryProps) => {
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
)(BaseCalorieSummary);

export default CalorieSummary;
