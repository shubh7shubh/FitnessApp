// src/modules/diary/components/MealSection.tsx

import React from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { MealType } from "@/modules/nutrition/types";

// Interface for displaying food items in meals
export interface DisplayFoodItem {
  id: string;
  name: string;
  calories: number;
  servings: number;
}

interface MealSectionProps {
  mealName: MealType;
  items: DisplayFoodItem[];
  dateString: string;
}

const MealSection = ({ mealName, items, dateString }: MealSectionProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

  // Meal icon mapping
  const getMealIcon = (name: MealType): keyof typeof Ionicons.glyphMap => {
    switch (name) {
      case "breakfast":
        return "sunny-outline";
      case "lunch":
        return "partly-sunny-outline";
      case "dinner":
        return "moon-outline";
      case "snacks":
        return "nutrition-outline";
      default:
        return "restaurant-outline";
    }
  };

  // Meal color mapping
  const getMealColor = (name: MealType): string => {
    switch (name) {
      case "breakfast":
        return "#FF9500"; // Orange
      case "lunch":
        return "#007AFF"; // Blue
      case "dinner":
        return "#5856D6"; // Purple
      case "snacks":
        return "#34C759"; // Green
      default:
        return "#6B7280"; // Gray
    }
  };

  const mealIcon = getMealIcon(mealName);
  const mealColor = getMealColor(mealName);
  const capitalizedMealName =
    mealName.charAt(0).toUpperCase() + mealName.slice(1);

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
        className="shadow-sm"
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: items.length > 0 ? 1 : 0,
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
                {capitalizedMealName}
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

        {/* List of food items */}
        {items.length > 0 && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 4,
            }}
          >
            {items.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center py-2"
              >
                <View className="flex-1">
                  <Text
                    style={{ color: colors.text.primary }}
                    className="text-sm font-medium"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {item.servings !== 1 && (
                    <Text
                      style={{ color: colors.text.secondary }}
                      className="text-xs"
                    >
                      {item.servings}{" "}
                      {item.servings === 1 ? "serving" : "servings"}
                    </Text>
                  )}
                </View>
                <Text
                  style={{ color: colors.text.secondary }}
                  className="text-sm ml-4"
                >
                  {Math.round(item.calories)} cal
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Add Food Button */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Link
            href={{
              pathname: "/nutrition/search",
              params: {
                mealType: mealName,
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
                borderWidth: 1,
                borderColor: colors.primary + "20",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
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
    </View>
  );
};

export default MealSection;
