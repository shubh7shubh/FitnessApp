// We'll import the types you've already defined in your nutrition module!
import { FoodItem, MealType } from "@/modules/nutrition/types";

// Exercise related types
export interface ExerciseItem {
  id: string;
  name: string;
  duration: number; // in minutes
  caloriesBurned: number;
  type: ExerciseType;
}

export type ExerciseType = "cardio" | "strength" | "flexibility" | "sports";

export interface ExerciseSession {
  name: string; // 'Cardio', 'Strength Training', 'Sports', etc.
  exercises: ExerciseItem[];
}

// This defines a meal section in the diary
export interface DiaryMeal {
  name: MealType; // 'Breakfast', 'Lunch', 'Dinner', 'Snacks'
  items: FoodItem[];
}

// This defines the entire diary for a single day
export interface DiaryEntry {
  date: string; // ISO format: '2023-10-27'
  meals: DiaryMeal[];
  exercises: ExerciseSession[];
}
