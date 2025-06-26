// stores/appStore.ts

import { create } from "zustand";
import { User } from "@/db/models/User"; // Import the WatermelonDB User model

// Define the shape of our state
interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To show a loading screen on app start
}

// Define the shape of our actions
interface AppActions {
  setCurrentUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

// Create the store
export const useAppStore = create<AppState & AppActions>(
  (set) => ({
    // Initial State
    currentUser: null,
    isAuthenticated: false,
    isLoading: true, // App starts in a loading state by default

    // Actions
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
      set({ currentUser: null, isAuthenticated: false });
    },
  })
);
