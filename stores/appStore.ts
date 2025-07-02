// stores/appStore.ts

import { create } from "zustand";
import { User } from "@/db/models/User"; // Import the WatermelonDB User model

// Define the shape of our state
interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To show a loading screen on app start
  onboardingComplete: boolean;
  selectedGoal: string | null; // Store the selected goal from onboarding
}

// Define the shape of our actions
interface AppActions {
  setCurrentUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  setOnboardingComplete: (isComplete: boolean) => void;
  setSelectedGoal: (goal: string) => void;
}

// Create the store (without persistence for now)
export const useAppStore = create<AppState & AppActions>((set) => ({
  // Initial State
  onboardingComplete: false, // Default to false, will be set to true when user exists
  currentUser: null,
  isAuthenticated: false,
  isLoading: true, // App starts in a loading state by default
  selectedGoal: null, // No goal selected initially

  // Actions
  setOnboardingComplete: (isComplete) => {
    set({ onboardingComplete: isComplete });
  },

  setSelectedGoal: (goal) => {
    set({ selectedGoal: goal });
  },

  setCurrentUser: (user) => {
    set({
      currentUser: user,
      isAuthenticated: !!user, // isAuthenticated will be true if user is not null, false otherwise
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  logout: () => {
    // In the future, this would also clear the database or just the user session
    set({
      currentUser: null,
      isAuthenticated: false,
      onboardingComplete: false,
      selectedGoal: null,
    });
  },
}));
