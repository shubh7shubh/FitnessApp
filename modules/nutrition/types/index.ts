export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  servingSize: string;
  servingUnit: string;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  isVerified?: boolean;
  category?: string;
}

export interface FoodLog {
  id: string;
  foodItem: FoodItem;
  servings: number;
  mealType: MealType;
  date: string;
  totalCalories: number;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type SearchTab = "all" | "myMeals" | "myRecipes" | "myFoods";

export interface SearchFilters {
  mealType: MealType;
  tab: SearchTab;
  query: string;
}

export interface NutritionState {
  selectedMealType: MealType;
  foodLogs: FoodLog[];
  searchHistory: FoodItem[];
  favoriteItems: FoodItem[];
}
