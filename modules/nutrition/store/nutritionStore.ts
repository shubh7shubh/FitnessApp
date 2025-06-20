import { create } from "zustand";
import { FoodLog, MealType, FoodItem, NutritionState } from "../types";

interface NutritionStore extends NutritionState {
  setSelectedMealType: (mealType: MealType) => void;
  addFoodLog: (foodLog: FoodLog) => void;
  removeFoodLog: (id: string) => void;
  addToHistory: (foodItem: FoodItem) => void;
  addToFavorites: (foodItem: FoodItem) => void;
  removeFromFavorites: (id: string) => void;
}

export const useNutritionStore = create<NutritionStore>((set, get) => ({
  selectedMealType: "lunch",
  foodLogs: [],
  searchHistory: [],
  favoriteItems: [],

  setSelectedMealType: (mealType: MealType) =>
    set({ selectedMealType: mealType }),

  addFoodLog: (foodLog: FoodLog) =>
    set((state) => ({
      foodLogs: [...state.foodLogs, foodLog],
    })),

  removeFoodLog: (id: string) =>
    set((state) => ({
      foodLogs: state.foodLogs.filter((log) => log.id !== id),
    })),

  addToHistory: (foodItem: FoodItem) =>
    set((state) => {
      const existingIndex = state.searchHistory.findIndex(
        (item) => item.id === foodItem.id
      );
      if (existingIndex >= 0) {
        // Move to front if already exists
        const newHistory = [...state.searchHistory];
        newHistory.splice(existingIndex, 1);
        return { searchHistory: [foodItem, ...newHistory] };
      }
      // Add to front, keep only last 10 items
      return {
        searchHistory: [foodItem, ...state.searchHistory].slice(0, 10),
      };
    }),

  addToFavorites: (foodItem: FoodItem) =>
    set((state) => {
      if (!state.favoriteItems.find((item) => item.id === foodItem.id)) {
        return { favoriteItems: [...state.favoriteItems, foodItem] };
      }
      return state;
    }),

  removeFromFavorites: (id: string) =>
    set((state) => ({
      favoriteItems: state.favoriteItems.filter((item) => item.id !== id),
    })),
}));
