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

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

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

// Helper function to convert Food model to FoodItem interface
export const foodModelToItem = (food: any): FoodItem => ({
  id: food.id,
  name: food.name,
  brand: food.brand,
  calories: food.calories,
  servingSize: food.servingSize?.toString() || "1",
  servingUnit: food.servingUnit || "serving",
  macros: {
    protein: food.protein_g || 0,
    carbs: food.carbs_g || 0,
    fat: food.fat_g || 0,
  },
  isVerified: true, // All local foods are considered verified
});
