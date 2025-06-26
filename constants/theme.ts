export const COLORS = {
  // Light theme colors
  light: {
    primary: "#4ADE80", // Green - energy and health
    secondary: "#2DD4BF", // Teal - secondary accent
    accent: "#F59E0B", // Amber - highlights and warnings
    background: "#FFFFFF", // White background
    surface: "#F9FAFB", // Light gray surface
    surfaceElevated: "#FFFFFF", // White elevated surface
    border: "#E5E7EB", // Light gray border
    text: {
      primary: "#111827", // Dark gray
      secondary: "#6B7280", // Medium gray
      muted: "#9CA3AF", // Light gray
      inverse: "#FFFFFF", // White text for dark backgrounds
    },
    status: {
      success: "#10B981", // Green
      warning: "#F59E0B", // Amber
      error: "#EF4444", // Red
      info: "#3B82F6", // Blue
    },
  },
  // Dark theme colors
  dark: {
    primary: "#4ADE80", // Green - consistent brand color
    secondary: "#2DD4BF", // Teal - secondary accent
    accent: "#F59E0B", // Amber - highlights and warnings
    background: "#000000", // Black background
    surface: "#1A1A1A", // Dark gray surface
    surfaceElevated: "#2A2A2A", // Lighter dark gray
    border: "#374151", // Medium gray border
    text: {
      primary: "#FFFFFF", // White text
      secondary: "#D1D5DB", // Light gray
      muted: "#9CA3AF", // Medium gray
      inverse: "#111827", // Dark text for light backgrounds
    },
    status: {
      success: "#10B981", // Green
      warning: "#F59E0B", // Amber
      error: "#EF4444", // Red
      info: "#3B82F6", // Blue
    },
  },
} as const;

// Fitness specific colors
export const FITNESS_COLORS = {
  calories: "#EF4444", // Red
  protein: "#3B82F6", // Blue
  carbs: "#F59E0B", // Orange
  fat: "#8B5CF6", // Purple
  water: "#06B6D4", // Cyan
  steps: "#10B981", // Green
  workout: "#EC4899", // Pink
  sleep: "#6366F1", // Indigo
} as const;

export type Theme = keyof typeof COLORS;
export type ColorScheme = typeof COLORS.light | typeof COLORS.dark;
