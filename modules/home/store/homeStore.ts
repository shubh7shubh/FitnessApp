import { create } from "zustand";
import {
  HomeState,
  UserStats,
  QuickAction,
} from "../types";
import { DiaryEntry } from "@/db/models/DiaryEntry";
import { User } from "@/db/models/User";

const initialStats: UserStats = {
  caloriesConsumed: 0,
  caloriesGoal: 2000, // A sensible default goal
  caloriesBurned: 0,
  proteinConsumed: 0,
  proteinGoal: 150, // A sensible default goal
  carbsConsumed: 0,
  carbsGoal: 250, // A sensible default goal
  fatConsumed: 0,
  fatGoal: 65, // A sensible default goal
  waterConsumed: 0,
  waterGoal: 2500,
  stepsCount: 0,
  stepsGoal: 10000,
  workoutsCompleted: 0,
  workoutGoal: 1,
  sleepHours: 0,
  sleepGoal: 8,
};

const dummyQuickActions: QuickAction[] = [
  {
    id: "1",
    title: "Log Food",
    icon: "restaurant",
    color: "#EF4444",
    route: "/food/log",
  },
  {
    id: "2",
    title: "Log Exercise",
    icon: "fitness",
    color: "#EC4899",
    route: "/exercise/log",
  },
  {
    id: "3",
    title: "Log Water",
    icon: "water",
    color: "#06B6D4",
    route: "/water/log",
  },
  {
    id: "4",
    title: "Weigh In",
    icon: "scale",
    color: "#8B5CF6",
    route: "/weight/log",
  },
];

interface HomeStore extends HomeState {
  updateTodayStats: (
    entries: DiaryEntry[],
    user: User
  ) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  addCalories: (calories: number) => void;
  addWater: (ml: number) => void;
  addSteps: (steps: number) => void;
  refreshData: () => Promise<void>;
}

export const useHomeStore = create<HomeStore>(
  (set, get) => ({
    todayStats: initialStats,
    weekProgress: [],
    quickActions: dummyQuickActions,
    isLoading: false,
    lastUpdated: new Date(),

    updateTodayStats: (entries, user) => {
      // 1. Calculate the consumed totals from the diary entries list
      const consumed = entries.reduce(
        (totals, entry) => {
          totals.calories += entry.calories;
          totals.protein += entry.protein_g;
          totals.carbs += entry.carbs_g;
          totals.fat += entry.fat_g;
          return totals;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // 2. We use your existing `updateStats` action to update the state.
      //    This is a great way to reuse code!
      get().updateStats({
        caloriesConsumed: consumed.calories,
        proteinConsumed: consumed.protein,
        carbsConsumed: consumed.carbs,
        fatConsumed: consumed.fat,
        // Get the live goals directly from the User model
        caloriesGoal: user.dailyCalorieGoal || 2000,
        proteinGoal: user.proteinGoal_g || 150,
        carbsGoal: user.carbsGoal_g || 250,
        fatGoal: user.fatGoal_g || 65,
      });
    },

    updateStats: (newStats: Partial<UserStats>) => {
      set((state: HomeStore) => ({
        todayStats: {
          ...state.todayStats,
          ...newStats,
        },
        lastUpdated: new Date(),
      }));
    },

    addCalories: (calories: number) => {
      const { todayStats } = get();
      set({
        todayStats: {
          ...todayStats,
          caloriesConsumed:
            todayStats.caloriesConsumed + calories,
        },
        lastUpdated: new Date(),
      });
    },

    addWater: (ml: number) => {
      const { todayStats } = get();
      set({
        todayStats: {
          ...todayStats,
          waterConsumed: Math.min(
            todayStats.waterConsumed + ml,
            todayStats.waterGoal
          ),
        },
        lastUpdated: new Date(),
      });
    },

    addSteps: (steps: number) => {
      const { todayStats } = get();
      set({
        todayStats: {
          ...todayStats,
          stepsCount: todayStats.stepsCount + steps,
        },
        lastUpdated: new Date(),
      });
    },

    refreshData: async (): Promise<void> => {
      set({ isLoading: true });

      // Simulate API call
      await new Promise<void>((resolve) =>
        setTimeout(resolve, 1000)
      );

      set({
        isLoading: false,
        lastUpdated: new Date(),
      });
    },
  })
);
