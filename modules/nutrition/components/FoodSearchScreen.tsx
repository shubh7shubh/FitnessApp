import React, { useState, useMemo, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useNutrition } from "../hooks/useNutrition";
import { FoodItem, MealType } from "../types";
import { FoodItemCard } from "../components/FoodItemCard";
import { useDiaryStore } from "@/modules/diary/store/useDiaryStore";

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
  const params = useLocalSearchParams<{
    mealType?: string;
    date?: string;
  }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [showMealDropdown, setShowMealDropdown] = useState(false);
  const dropdownAnimation = React.useRef(new Animated.Value(0)).current;

  const { addFoodToMeal } = useDiaryStore();

  const {
    selectedMealType,
    setSelectedMealType,
    searchHistory,
    useSearchFoods,
    useSuggestedFoods,
    isAddingFood,
  } = useNutrition();

  // Set initial meal type from params
  useEffect(() => {
    if (
      params.mealType &&
      MEAL_TYPES.some((m) => m.value === params.mealType)
    ) {
      setSelectedMealType(params.mealType as MealType);
    }
  }, [params.mealType, setSelectedMealType]);

  const { data: searchResults = [], isLoading: isSearching } =
    useSearchFoods(searchQuery);
  const { data: suggestions = [] } = useSuggestedFoods();

  const selectedMeal = MEAL_TYPES.find(
    (meal) => meal.value === selectedMealType
  );

  const handleFoodSelect = (food: FoodItem) => {
    // Use diary store if we have date params, otherwise use nutrition store
    if (params.date) {
      addFoodToMeal(params.date, selectedMealType, food);
      router.back();
    } else {
      // Fallback to today's date
      const today = new Date().toISOString().split("T")[0];
      addFoodToMeal(today, selectedMealType, food);
      router.back();
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
              <Ionicons
                name="arrow-back"
                size={20}
                color={showMealDropdown ? "#4ADE80" : "#6B7280"}
              />
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
                      onPress={() => handleFoodSelect(food)}
                      isLoading={isAddingFood}
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
                {suggestions.slice(0, 10).map((food) => (
                  <FoodItemCard
                    key={food.id}
                    food={food}
                    onPress={() => handleFoodSelect(food)}
                    isLoading={isAddingFood}
                    showAddButton={true}
                  />
                ))}
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
                      onPress={() => handleFoodSelect(food)}
                      isLoading={isAddingFood}
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
