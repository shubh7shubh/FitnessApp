import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FoodItem } from "../types";

interface FoodItemCardProps {
  food: FoodItem;
  onPress: () => void;
  isLoading?: boolean;
  showAddButton?: boolean;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  food,
  onPress,
  isLoading = false,
  showAddButton = true,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 mb-2"
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="flex-1 mr-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {food.name}
          </Text>
          {food.isVerified && (
            <View className="ml-2 w-4 h-4 bg-green-500 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={10} color="white" />
            </View>
          )}
        </View>

        {food.brand && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {food.brand}
          </Text>
        )}

        <View className="flex-row items-center">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {food.calories} cal • {food.servingSize} {food.servingUnit}
          </Text>
        </View>
      </View>

      {showAddButton && (
        <TouchableOpacity
          onPress={onPress}
          disabled={isLoading}
          className="w-10 h-10 items-center justify-center bg-green-500 rounded-full active:bg-green-600"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="add" size={20} color="white" />
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
