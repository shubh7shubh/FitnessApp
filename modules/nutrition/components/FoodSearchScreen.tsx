import React, { useState, useMemo } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNutrition } from "../hooks/useNutrition";
import { FoodItem, MealType } from "../types";
import { FoodItemCard } from "../components/FoodItemCard";

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
    value: "snack",
    label: "Snack",
    icon: "nutrition-outline",
  },
] as const;

export const FoodSearchScreen: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMealDropdown, setShowMealDropdown] =
    useState(false);
  const dropdownAnimation = React.useRef(
    new Animated.Value(0)
  ).current;

  const {
    selectedMealType,
    setSelectedMealType,
    searchHistory,
    useSearchFoods,
    useSuggestedFoods,
    addFood,
    isAddingFood,
  } = useNutrition();

  const {
    data: searchResults = [],
    isLoading: isSearching,
  } = useSearchFoods(searchQuery);
  const { data: suggestions = [] } = useSuggestedFoods();

  const selectedMeal = MEAL_TYPES.find(
    (meal) => meal.value === selectedMealType
  );

  const handleFoodSelect = (food: FoodItem) => {
    addFood({ foodItem: food, servings: 1 });
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#111827"
      />

      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={
                  showMealDropdown ? "#4ADE80" : "#6B7280"
                }
              />
            </TouchableOpacity>

            {/* Meal Type Selector */}
            <TouchableOpacity
              onPress={toggleDropdown}
              className="flex-row items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <Ionicons
                name={selectedMeal?.icon || "sunny-outline"}
                size={20}
                color="#4ADE80"
                className="mr-2"
              />
              <Text className="text-base font-medium text-gray-900 dark:text-white mx-2">
                {selectedMeal?.label}
              </Text>
              <Ionicons
                name={
                  showMealDropdown
                    ? "chevron-up"
                    : "chevron-down"
                }
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
                  translateY: dropdownAnimation.interpolate(
                    {
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }
                  ),
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
                  index === MEAL_TYPES.length - 1
                    ? "rounded-b-lg"
                    : ""
                }`}
              >
                <Ionicons
                  name={meal.icon}
                  size={18}
                  color={
                    selectedMealType === meal.value
                      ? "#4ADE80"
                      : "#6B7280"
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
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#4ADE80"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Search Bar */}
          <View className="mt-2">
            <View className="relative">
              <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                <Ionicons
                  name="search"
                  size={18}
                  color="#9CA3AF"
                />
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
                    <Ionicons
                      name="close"
                      size={14}
                      color="#6B7280"
                    />
                  </View>
                </TouchableOpacity>
              )}

              {isSearching && (
                <View className="absolute right-4 top-0 bottom-0 justify-center">
                  <ActivityIndicator
                    size="small"
                    color="#4ADE80"
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 bg-white dark:bg-gray-900"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* History Section */}
          {!searchQuery && searchHistory.length > 0 && (
            <View className="px-4 py-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent
                </Text>
              </View>

              <View className="space-y-2">
                {searchHistory
                  .slice(0, 3)
                  .map((food: FoodItem) => (
                    <FoodItemCard
                      key={`history-${food.id}`}
                      food={food}
                      onPress={() => handleFoodSelect(food)}
                      isLoading={isAddingFood}
                      showAddButton
                    />
                  ))}
              </View>
            </View>
          )}

          {/* Suggestions Section */}
          {!searchQuery && suggestions.length > 0 && (
            <View className="px-4 py-6">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Suggestions
              </Text>

              <View className="space-y-2">
                {suggestions.map((food: FoodItem) => (
                  <FoodItemCard
                    key={`suggestion-${food.id}`}
                    food={food}
                    onPress={() => handleFoodSelect(food)}
                    isLoading={isAddingFood}
                    showAddButton
                  />
                ))}
              </View>
            </View>
          )}

          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && (
            <View className="px-4 py-6">
              <View className="space-y-2">
                {searchResults.map((food: FoodItem) => (
                  <FoodItemCard
                    key={`search-${food.id}`}
                    food={food}
                    onPress={() => handleFoodSelect(food)}
                    isLoading={isAddingFood}
                    showAddButton
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
