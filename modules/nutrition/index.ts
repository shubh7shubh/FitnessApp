// Components
export { QuickLogModal } from "./components/QuickLogModal";
export { FoodSearchScreen } from "./components/FoodSearchScreen";
export { FoodItemCard } from "./components/FoodItemCard";
export { NutritionSummary } from "./components/NutritionSummary";

// Hooks
export { useNutrition } from "./hooks/useNutrition";

// Store
export { useNutritionStore } from "./store/nutritionStore";

// Types
export type {
  FoodItem,
  FoodLog,
  MealType,
  SearchTab,
  SearchFilters,
  NutritionState,
} from "./types";

// Services
export {
  searchFoods,
  getFoodById,
  getSuggestedFoods,
} from "./services/foodService";
