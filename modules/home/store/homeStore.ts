import { create } from "zustand";
import { HomeState, UserStats, QuickAction } from "../types";

// Dummy data for development
const dummyStats: UserStats = {
  caloriesConsumed: 1250,
  caloriesGoal: 2000,
  caloriesBurned: 320,
  proteinConsumed: 85,
  proteinGoal: 120,
  carbsConsumed: 150,
  carbsGoal: 250,
  fatConsumed: 45,
  fatGoal: 65,
  waterConsumed: 1800,
  waterGoal: 2500,
  stepsCount: 8540,
  stepsGoal: 10000,
  workoutsCompleted: 1,
  workoutGoal: 1,
  sleepHours: 7.5,
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
  updateStats: (stats: Partial<UserStats>) => void;
  addCalories: (calories: number) => void;
  addWater: (ml: number) => void;
  addSteps: (steps: number) => void;
  refreshData: () => Promise<void>;
}

export const useHomeStore = create<HomeStore>((set, get) => ({
  todayStats: dummyStats,
  weekProgress: [],
  quickActions: dummyQuickActions,
  isLoading: false,
  lastUpdated: new Date(),

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
        caloriesConsumed: todayStats.caloriesConsumed + calories,
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
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));

    set({
      isLoading: false,
      lastUpdated: new Date(),
    });
  },
}));
