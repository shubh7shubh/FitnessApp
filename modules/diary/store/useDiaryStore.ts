import { create } from "zustand";
import { produce } from "immer";
import {
  DiaryEntry,
  DiaryMeal,
  ExerciseSession,
  ExerciseItem,
} from "../types";
import {
  FoodItem,
  MealType,
} from "@/modules/nutrition/types";
import exercisesData from "@/lib/dummy-data/exercises.json";

// Helper function to create an empty diary for a new day
const createEmptyDiary = (date: string): DiaryEntry => ({
  date,
  meals: [
    { name: "breakfast", items: [] },
    { name: "lunch", items: [] },
    { name: "dinner", items: [] },
    { name: "snacks", items: [] },
  ],
  exercises: [
    { name: "Cardio", exercises: [] },
    { name: "Strength Training", exercises: [] },
    { name: "Flexibility", exercises: [] },
    { name: "Sports", exercises: [] },
  ],
});

interface DiaryState {
  entries: { [date: string]: DiaryEntry }; // Key-value store for diaries by date
  getDiaryForDate: (date: string) => DiaryEntry;
  addFoodToMeal: (
    date: string,
    mealName: MealType,
    food: FoodItem
  ) => void;
  removeFoodFromMeal: (
    date: string,
    mealName: MealType,
    foodId: string
  ) => void;
  getTotalCaloriesForDate: (date: string) => number;
  getCaloriesForMeal: (
    date: string,
    mealName: MealType
  ) => number;
  clearMeal: (date: string, mealName: MealType) => void;

  // Exercise methods
  addExerciseToSession: (
    date: string,
    sessionName: string,
    exercise: ExerciseItem
  ) => void;
  removeExerciseFromSession: (
    date: string,
    sessionName: string,
    exerciseId: string
  ) => void;
  getTotalCaloriesBurnedForDate: (date: string) => number;
  getCaloriesBurnedForSession: (
    date: string,
    sessionName: string
  ) => number;
  clearExerciseSession: (
    date: string,
    sessionName: string
  ) => void;
  getAvailableExercises: () => ExerciseItem[];
}

// Helper function to create a diary with sample data for today
const createSampleDiary = (date: string): DiaryEntry => {
  const diary = createEmptyDiary(date);

  // Add some sample exercises for demonstration
  if (date === new Date().toISOString().split("T")[0]) {
    // Add sample exercises to Cardio session
    diary.exercises[0].exercises = [
      {
        id: "sample-1",
        name: "Running",
        duration: 30,
        caloriesBurned: 320,
        type: "cardio",
      },
    ];

    // Add sample exercises to Strength Training session
    diary.exercises[1].exercises = [
      {
        id: "sample-2",
        name: "Push-ups",
        duration: 15,
        caloriesBurned: 85,
        type: "strength",
      },
    ];
  }

  return diary;
};

export const useDiaryStore = create<DiaryState>(
  (set, get) => ({
    entries: {
      // Pre-populate today with sample diary
      [new Date().toISOString().split("T")[0]]:
        createSampleDiary(
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
          const meal = draft.entries[date].meals.find(
            (m) => m.name === mealName
          );
          if (meal) {
            meal.items.push(food);
          }
        })
      ),

    removeFoodFromMeal: (date, mealName, foodId) =>
      set(
        produce((draft: DiaryState) => {
          if (!draft.entries[date]) return;

          const meal = draft.entries[date].meals.find(
            (m) => m.name === mealName
          );
          if (meal) {
            meal.items = meal.items.filter(
              (item) => item.id !== foodId
            );
          }
        })
      ),

    getTotalCaloriesForDate: (date) => {
      const diary = get().getDiaryForDate(date);
      return diary.meals.reduce(
        (total, meal) =>
          total +
          meal.items.reduce(
            (mealTotal, item) => mealTotal + item.calories,
            0
          ),
        0
      );
    },

    getCaloriesForMeal: (date, mealName) => {
      const diary = get().getDiaryForDate(date);
      const meal = diary.meals.find(
        (m) => m.name === mealName
      );
      if (!meal) return 0;

      return meal.items.reduce(
        (total, item) => total + item.calories,
        0
      );
    },

    clearMeal: (date, mealName) =>
      set(
        produce((draft: DiaryState) => {
          if (!draft.entries[date]) return;

          const meal = draft.entries[date].meals.find(
            (m) => m.name === mealName
          );
          if (meal) {
            meal.items = [];
          }
        })
      ),

    // Exercise methods implementation
    addExerciseToSession: (date, sessionName, exercise) =>
      set(
        produce((draft: DiaryState) => {
          // Ensure the diary for the date exists
          if (!draft.entries[date]) {
            draft.entries[date] = createEmptyDiary(date);
          }
          const session = draft.entries[
            date
          ].exercises.find((s) => s.name === sessionName);
          if (session) {
            session.exercises.push(exercise);
          }
        })
      ),

    removeExerciseFromSession: (
      date,
      sessionName,
      exerciseId
    ) =>
      set(
        produce((draft: DiaryState) => {
          if (!draft.entries[date]) return;

          const session = draft.entries[
            date
          ].exercises.find((s) => s.name === sessionName);
          if (session) {
            session.exercises = session.exercises.filter(
              (exercise) => exercise.id !== exerciseId
            );
          }
        })
      ),

    getTotalCaloriesBurnedForDate: (date) => {
      const diary = get().getDiaryForDate(date);
      return diary.exercises.reduce(
        (total, session) =>
          total +
          session.exercises.reduce(
            (sessionTotal, exercise) =>
              sessionTotal + exercise.caloriesBurned,
            0
          ),
        0
      );
    },

    getCaloriesBurnedForSession: (date, sessionName) => {
      const diary = get().getDiaryForDate(date);
      const session = diary.exercises.find(
        (s) => s.name === sessionName
      );
      if (!session) return 0;

      return session.exercises.reduce(
        (total, exercise) =>
          total + exercise.caloriesBurned,
        0
      );
    },

    clearExerciseSession: (date, sessionName) =>
      set(
        produce((draft: DiaryState) => {
          if (!draft.entries[date]) return;

          const session = draft.entries[
            date
          ].exercises.find((s) => s.name === sessionName);
          if (session) {
            session.exercises = [];
          }
        })
      ),

    getAvailableExercises: () => {
      return exercisesData as ExerciseItem[];
    },
  })
);
