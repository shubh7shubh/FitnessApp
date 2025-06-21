import { create } from "zustand";
import { produce } from "immer";
import { DiaryEntry, DiaryMeal } from "../types";
import { FoodItem, MealType } from "@/modules/nutrition/types";

// Helper function to create an empty diary for a new day
const createEmptyDiary = (date: string): DiaryEntry => ({
  date,
  meals: [
    { name: "breakfast", items: [] },
    { name: "lunch", items: [] },
    { name: "dinner", items: [] },
    { name: "snack", items: [] },
  ],
});

interface DiaryState {
  entries: { [date: string]: DiaryEntry }; // Key-value store for diaries by date
  getDiaryForDate: (date: string) => DiaryEntry;
  addFoodToMeal: (date: string, mealName: MealType, food: FoodItem) => void;
  removeFoodFromMeal: (
    date: string,
    mealName: MealType,
    foodId: string
  ) => void;
  getTotalCaloriesForDate: (date: string) => number;
  getCaloriesForMeal: (date: string, mealName: MealType) => number;
  clearMeal: (date: string, mealName: MealType) => void;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  entries: {
    // Let's pre-populate today with an empty diary
    [new Date().toISOString().split("T")[0]]: createEmptyDiary(
      new Date().toISOString().split("T")[0]
    ),
  },

  getDiaryForDate: (date) => {
    const existing = get().entries[date];
    if (existing) {
      return existing;
    }
    // If we swipe to a new day, create an empty diary for it on the fly
    const newDiary = createEmptyDiary(date);
    set(
      produce((draft: DiaryState) => {
        draft.entries[date] = newDiary;
      })
    );
    return newDiary;
  },

  addFoodToMeal: (date, mealName, food) =>
    set(
      produce((draft: DiaryState) => {
        // Ensure the diary for the date exists
        if (!draft.entries[date]) {
          draft.entries[date] = createEmptyDiary(date);
        }
        const meal = draft.entries[date].meals.find((m) => m.name === mealName);
        if (meal) {
          meal.items.push(food);
        }
      })
    ),

  removeFoodFromMeal: (date, mealName, foodId) =>
    set(
      produce((draft: DiaryState) => {
        if (!draft.entries[date]) return;

        const meal = draft.entries[date].meals.find((m) => m.name === mealName);
        if (meal) {
          meal.items = meal.items.filter((item) => item.id !== foodId);
        }
      })
    ),

  getTotalCaloriesForDate: (date) => {
    const diary = get().getDiaryForDate(date);
    return diary.meals.reduce(
      (total, meal) =>
        total +
        meal.items.reduce((mealTotal, item) => mealTotal + item.calories, 0),
      0
    );
  },

  getCaloriesForMeal: (date, mealName) => {
    const diary = get().getDiaryForDate(date);
    const meal = diary.meals.find((m) => m.name === mealName);
    if (!meal) return 0;

    return meal.items.reduce((total, item) => total + item.calories, 0);
  },

  clearMeal: (date, mealName) =>
    set(
      produce((draft: DiaryState) => {
        if (!draft.entries[date]) return;

        const meal = draft.entries[date].meals.find((m) => m.name === mealName);
        if (meal) {
          meal.items = [];
        }
      })
    ),
}));
