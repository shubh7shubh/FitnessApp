import { useState, useEffect } from "react";
import {
  searchFoods,
  getFoodById,
  getSuggestedFoods,
} from "../services/foodService";
import { useNutritionStore } from "../store/nutritionStore";
import { FoodItem, FoodLog, MealType } from "../types";

export const useNutrition = () => {
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const {
    selectedMealType,
    foodLogs,
    searchHistory,
    favoriteItems,
    setSelectedMealType,
    addFoodLog,
    removeFoodLog,
    addToHistory,
    addToFavorites,
    removeFromFavorites,
  } = useNutritionStore();

  // Load suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const data = await getSuggestedFoods();
        setSuggestions(data);
      } catch (error) {
        console.error("Error loading suggestions:", error);
      }
    };
    loadSuggestions();
  }, []);

  const useSearchFoods = (query: string) => {
    useEffect(() => {
      const searchFood = async () => {
        if (query === "") {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        setIsSearching(true);
        try {
          const data = await searchFoods(query);
          setSearchResults(data);
        } catch (error) {
          console.error("Error searching foods:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      };

      const timeoutId = setTimeout(searchFood, 300);
      return () => clearTimeout(timeoutId);
    }, [query]);

    return { data: searchResults, isLoading: isSearching };
  };

  const useSuggestedFoods = () => {
    return { data: suggestions };
  };

  const useFoodDetails = (id: string) => {
    const [food, setFood] = useState<FoodItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (!id) return;

      const loadFood = async () => {
        setIsLoading(true);
        try {
          const data = await getFoodById(id);
          setFood(data);
        } catch (error) {
          console.error("Error loading food details:", error);
          setFood(null);
        } finally {
          setIsLoading(false);
        }
      };

      loadFood();
    }, [id]);

    return { data: food, isLoading };
  };

  const addFood = async ({
    foodItem,
    servings,
  }: {
    foodItem: FoodItem;
    servings: number;
  }) => {
    setIsAddingFood(true);
    try {
      const totalCalories = Math.round(foodItem.calories * servings);
      const foodLog: FoodLog = {
        id: Date.now().toString(),
        foodItem,
        servings,
        mealType: selectedMealType,
        date: new Date().toISOString(),
        totalCalories,
      };

      addFoodLog(foodLog);
      addToHistory(foodItem);
    } catch (error) {
      console.error("Error adding food:", error);
    } finally {
      setIsAddingFood(false);
    }
  };

  const removeFood = async (logId: string) => {
    try {
      removeFoodLog(logId);
    } catch (error) {
      console.error("Error removing food:", error);
    }
  };

  const getTotalCaloriesForDay = (date: string): number => {
    return foodLogs
      .filter((log) => log.date.startsWith(date))
      .reduce((total, log) => total + log.totalCalories, 0);
  };

  const getCaloriesForMeal = (mealType: MealType, date: string): number => {
    return foodLogs
      .filter((log) => log.mealType === mealType && log.date.startsWith(date))
      .reduce((total, log) => total + log.totalCalories, 0);
  };

  return {
    // State
    selectedMealType,
    foodLogs,
    searchHistory,
    favoriteItems,

    // Actions
    setSelectedMealType,
    addToFavorites,
    removeFromFavorites,

    // Hooks
    useSearchFoods,
    useSuggestedFoods,
    useFoodDetails,

    // Mutations
    addFood,
    removeFood,
    isAddingFood,

    // Computed values
    getTotalCaloriesForDay,
    getCaloriesForMeal,
  };
};
