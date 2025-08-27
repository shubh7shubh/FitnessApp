import { View, Text, Pressable, useColorScheme } from "react-native";
import React from "react";
import { ExerciseSession } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

interface ExerciseSectionProps {
  exerciseSession: ExerciseSession;
  dateString: string;
  index: number;
}

export const ExerciseSection = ({
  exerciseSession,
  dateString,
  index,
}: ExerciseSectionProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const totalCaloriesBurned = exerciseSession.exercises.reduce(
    (sum, exercise) => sum + exercise.caloriesBurned,
    0
  );

  const totalDuration = exerciseSession.exercises.reduce(
    (sum, exercise) => sum + exercise.duration,
    0
  );

  // Get exercise session icon based on session type
  const getSessionIcon = (
    sessionName: string
  ): keyof typeof Ionicons.glyphMap => {
    switch (sessionName.toLowerCase()) {
      case "cardio":
        return "heart";
      case "strength training":
        return "barbell";
      case "flexibility":
        return "body";
      case "sports":
        return "football";
      default:
        return "fitness";
    }
  };

  const getSessionColor = (sessionName: string): string => {
    switch (sessionName.toLowerCase()) {
      case "cardio":
        return "#EF4444"; // Red
      case "strength training":
        return "#3B82F6"; // Blue
      case "flexibility":
        return "#10B981"; // Green
      case "sports":
        return "#F59E0B"; // Amber
      default:
        return colors.primary;
    }
  };

  const sessionIcon = getSessionIcon(exerciseSession.name);
  const sessionColor = getSessionColor(exerciseSession.name);

  return (
    <View className={`mb-0 ${index === 0 ? "mt-4" : ""}`}>
      <View
        style={{
          backgroundColor: colors.surface,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
        className="shadow-sm"
      >
        {/* Compact Exercise Session Header */}
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: exerciseSession.exercises.length > 0 ? 1 : 0,
            borderBottomColor: colors.border,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons
                name={sessionIcon}
                size={18}
                color={sessionColor}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{ color: colors.text.primary }}
                className="text-base font-semibold"
              >
                {exerciseSession.name}
              </Text>
            </View>

            <View className="items-end">
              <Text
                style={{ color: colors.text.primary }}
                className="text-base font-bold"
              >
                {Math.round(totalCaloriesBurned)} cal
              </Text>
              <Text
                style={{ color: colors.text.secondary }}
                className="text-xs"
              >
                {totalDuration} min
              </Text>
            </View>
          </View>
        </View>

        {/* Compact Exercise Items */}
        {exerciseSession.exercises.length > 0 && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 4,
            }}
          >
            {exerciseSession.exercises.map((exercise, index) => (
              <View
                key={`${exercise.id}-${index}`}
                className="flex-row justify-between items-center py-1"
              >
                <View className="flex-1">
                  <Text
                    style={{ color: colors.text.primary }}
                    className="text-sm font-medium"
                    numberOfLines={1}
                  >
                    {exercise.name}
                  </Text>
                  <Text
                    style={{ color: colors.text.secondary }}
                    className="text-xs"
                  >
                    {exercise.duration} min
                  </Text>
                </View>

                <Text
                  style={{ color: colors.text.secondary }}
                  className="text-sm ml-4"
                >
                  {Math.round(exercise.caloriesBurned)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Compact Add Exercise Button */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Pressable
            style={{
              backgroundColor: sessionColor + "10",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: sessionColor + "20",
            }}
            className="flex-row items-center justify-center"
            onPress={() => {
              // TODO: Navigate to exercise search screen
              console.log("Add exercise pressed");
            }}
          >
            <Ionicons
              name="add"
              size={16}
              color={sessionColor}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{ color: sessionColor }}
              className="text-sm font-medium"
            >
              Add Exercise
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
