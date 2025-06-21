import { View, Text, Pressable, useColorScheme } from "react-native";
import React from "react";
import { DiaryMeal } from "../types";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FITNESS_COLORS } from "@/constants/theme";

interface MealSectionProps {
  meal: DiaryMeal;
  dateString: string;
}

const MealSection = ({ meal, dateString }: MealSectionProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const totalCalories = meal.items.reduce(
    (sum, item) => sum + item.calories,
    0
  );

  // Get meal icon based on meal type
  const getMealIcon = (mealName: string): keyof typeof Ionicons.glyphMap => {
    switch (mealName.toLowerCase()) {
      case "breakfast":
        return "sunny";
      case "lunch":
        return "partly-sunny";
      case "dinner":
        return "moon";
      case "snack":
        return "nutrition";
      default:
        return "restaurant";
    }
  };

  const getMealColor = (mealName: string): string => {
    switch (mealName.toLowerCase()) {
      case "breakfast":
        return "#F59E0B"; // Amber
      case "lunch":
        return "#10B981"; // Green
      case "dinner":
        return "#8B5CF6"; // Purple
      case "snack":
        return "#F97316"; // Orange
      default:
        return colors.primary;
    }
  };

  const mealIcon = getMealIcon(meal.name);
  const mealColor = getMealColor(meal.name);

  return (
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
      {/* Compact Meal Header */}
      <View
        style={{
          backgroundColor: colors.surfaceElevated,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: meal.items.length > 0 ? 1 : 0,
          borderBottomColor: colors.border,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons
              name={mealIcon}
              size={18}
              color={mealColor}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{ color: colors.text.primary }}
              className="text-base font-semibold"
            >
              {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
            </Text>
          </View>

          <Text
            style={{ color: colors.text.primary }}
            className="text-base font-bold"
          >
            {Math.round(totalCalories)} cal
          </Text>
        </View>
      </View>

      {/* Compact Food Items */}
      {meal.items.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          {meal.items.map((item, index) => (
            <View
              key={`${item.id}-${index}`}
              className="flex-row justify-between items-center py-1"
            >
              <View className="flex-1">
                <Text
                  style={{ color: colors.text.primary }}
                  className="text-sm font-medium"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>

              <Text
                style={{ color: colors.text.secondary }}
                className="text-sm ml-4"
              >
                {Math.round(item.calories)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Compact Add Food Button */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Link
          href={{
            pathname: "/nutrition/search",
            params: {
              mealType: meal.name,
              date: dateString,
            },
          }}
          asChild
        >
          <Pressable
            style={{
              backgroundColor: colors.primary + "10",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: colors.primary + "20",
            }}
            className="flex-row items-center justify-center"
          >
            <Ionicons
              name="add"
              size={16}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{ color: colors.primary }}
              className="text-sm font-medium"
            >
              Add Food
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

export default MealSection;
