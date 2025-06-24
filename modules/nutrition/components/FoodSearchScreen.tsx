import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import { MealType, FoodItem } from "../types";
import { FoodItemCard } from "../components/FoodItemCard";
import { useNutrition } from "../hooks/useNutrition";
import { searchFoods } from "@/db/actions/diaryActions";

type MealTypeInfo = {
  value: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MEAL_TYPES: MealTypeInfo[] = [
  {
    value: "breakfast",
    label: "Breakfast",
    icon: "sunny-outline",
  },
  {
    value: "lunch",
    label: "Lunch",
    icon: "partly-sunny-outline",
  },
  {
    value: "dinner",
    label: "Dinner",
    icon: "moon-outline",
  },
  {
    value: "snacks",
    label: "Snacks",
    icon: "nutrition-outline",
  },
] as const;

export const FoodSearchScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mealType?: string;
    date?: string;
  }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [showMealDropdown, setShowMealDropdown] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    params.mealType ? (params.mealType as MealType) : "breakfast"
  );

  const dropdownAnimation = React.useRef(new Animated.Value(0)).current;

  // Use our nutrition hook for local-first operations
  const {
    isInitialized,
    searchResults, // FoodItem[] for UI display
    searchResultsRaw, // Food[] models for database operations
    isSearching,
    searchHistory,
    isAddingFood,
    setIsAddingFood,
    suggestedFoods,
    performSearch,
    addFoodToDiary,
  } = useNutrition();

  // Get current date or use provided date
  const dateToLog = useMemo(() => {
    if (params.date) return params.date;
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD format
  }, [params.date]);

  // Find the selected meal info
  const selectedMeal = useMemo(
    () => MEAL_TYPES.find((meal) => meal.value === selectedMealType),
    [selectedMealType]
  );

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (isInitialized) {
        performSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, isInitialized, performSearch]);

  const handleFoodSelect = async (
    foodItem: FoodItem,
    isFromSearch: boolean = false
  ) => {
    try {
      setIsAddingFood(foodItem.id);

      let foodModel;

      if (isFromSearch) {
        // Find the corresponding Food model from search results
        foodModel = searchResultsRaw.find((food) => food.id === foodItem.id);
        if (!foodModel) {
          throw new Error("Food model not found in search results");
        }
      } else {
        // For history/suggested foods, we need to search the database
        const searchResults = await searchFoods(foodItem.name);
        foodModel = searchResults.find((food) => food.id === foodItem.id);

        if (!foodModel) {
          throw new Error("Food not found in database");
        }
      }

      await addFoodToDiary(foodModel, selectedMealType, dateToLog, 1);

      // Show success and navigate back
      Alert.alert(
        "Success",
        `${foodItem.name} added to ${selectedMeal?.label}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error adding food:", error);
      Alert.alert("Error", "Failed to add food to diary. Please try again.");
      setIsAddingFood(null);
    }
  };

  const toggleDropdown = () => {
    const toValue = showMealDropdown ? 0 : 1;
    setShowMealDropdown(!showMealDropdown);
    Animated.spring(dropdownAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  };

  const handleMealSelect = (mealType: MealType) => {
    setSelectedMealType(mealType);
    toggleDropdown();
  };

  // Show loading if database is not initialized
  if (!isInitialized) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4ADE80" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">
            Initializing food database...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <Ionicons name="arrow-back" size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Meal Type Selector */}
            <TouchableOpacity
              onPress={toggleDropdown}
              className="flex-row items-center px-4 py-2 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <Ionicons
                name={selectedMeal?.icon || "sunny-outline"}
                size={20}
                color="#4ADE80"
                className="mr-2"
              />
              <Text className="text-xl font-medium text-gray-900 dark:text-white mx-2">
                {selectedMeal?.label}
              </Text>
              <Ionicons
                name={showMealDropdown ? "chevron-up" : "chevron-down"}
                size={16}
                color="#6B7280"
              />
            </TouchableOpacity>

            <View className="w-10" />
          </View>

          {/* Dropdown Menu */}
          <Animated.View
            className={`absolute top-16 right-8 left-8 z-20 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg ${
              showMealDropdown ? "" : "hidden"
            }`}
            style={{
              transform: [
                {
                  translateY: dropdownAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
              opacity: dropdownAnimation,
            }}
          >
            {MEAL_TYPES.map((meal, index) => (
              <TouchableOpacity
                key={meal.value}
                onPress={() => handleMealSelect(meal.value)}
                className={`flex-row items-center px-4 py-3 ${
                  selectedMealType === meal.value
                    ? "bg-green-50 dark:bg-green-900/20"
                    : ""
                } ${index === 0 ? "rounded-t-lg" : ""} ${
                  index === MEAL_TYPES.length - 1 ? "rounded-b-lg" : ""
                }`}
              >
                <Ionicons
                  name={meal.icon}
                  size={18}
                  color={
                    selectedMealType === meal.value ? "#4ADE80" : "#6B7280"
                  }
                />
                <Text
                  className={`text-base ml-3 ${
                    selectedMealType === meal.value
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {meal.label}
                </Text>
                {selectedMealType === meal.value && (
                  <View className="ml-auto">
                    <Ionicons name="checkmark" size={18} color="#4ADE80" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Search Bar */}
          <View className="mt-2">
            <View className="relative">
              <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                <Ionicons name="search" size={18} color="#9CA3AF" />
              </View>

              <TextInput
                placeholder="Search for a food"
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-base pl-12 pr-12 py-3 rounded-lg"
                selectionColor="#4ADE80"
              />

              {searchQuery.length > 0 && !isSearching && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  className="absolute right-4 top-0 bottom-0 justify-center"
                >
                  <View className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center">
                    <Ionicons name="close" size={14} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              )}

              {isSearching && (
                <View className="absolute right-4 top-0 bottom-0 justify-center">
                  <ActivityIndicator size="small" color="#4ADE80" />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {searchQuery.length === 0 ? (
            <View className="px-4">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <View className="mt-6">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Recent
                  </Text>
                  {searchHistory.slice(0, 5).map((food) => (
                    <FoodItemCard
                      key={food.id}
                      food={food}
                      onPress={() => handleFoodSelect(food, false)}
                      isLoading={isAddingFood === food.id}
                      showAddButton={true}
                    />
                  ))}
                </View>
              )}

              {/* Suggested Foods */}
              <View className="mt-6">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Suggested Foods
                </Text>
                {suggestedFoods.length > 0 ? (
                  suggestedFoods.map((food) => (
                    <FoodItemCard
                      key={food.id}
                      food={food}
                      onPress={() => handleFoodSelect(food, false)}
                      isLoading={isAddingFood === food.id}
                      showAddButton={true}
                    />
                  ))
                ) : (
                  <Text className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No recent foods. Start by searching for foods above.
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View className="px-4 mt-4">
              {isSearching ? (
                <View className="flex-1 justify-center items-center py-20">
                  <ActivityIndicator size="large" color="#4ADE80" />
                  <Text className="text-gray-500 dark:text-gray-400 mt-4">
                    Searching foods...
                  </Text>
                </View>
              ) : searchResults.length > 0 ? (
                <>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Search Results ({searchResults.length})
                  </Text>
                  {searchResults.map((food) => (
                    <FoodItemCard
                      key={food.id}
                      food={food}
                      onPress={() => handleFoodSelect(food, true)}
                      isLoading={isAddingFood === food.id}
                      showAddButton={true}
                    />
                  ))}
                </>
              ) : (
                <View className="flex-1 justify-center items-center py-20">
                  <Ionicons name="search" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
                    No foods found for "{searchQuery}"
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 mt-2 text-center">
                    Try a different search term
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
