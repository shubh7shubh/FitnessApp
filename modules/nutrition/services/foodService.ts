import { FoodItem } from "../types";

// Dummy food data for development
const DUMMY_FOODS: FoodItem[] = [
  {
    id: "1",
    name: "Apple",
    calories: 104,
    servingSize: "1.0",
    servingUnit: "medium",
    macros: {
      protein: 0.5,
      carbs: 27.6,
      fat: 0.3,
      fiber: 4.8,
      sugar: 20.7,
    },
    isVerified: true,
    category: "fruits",
  },
  {
    id: "2",
    name: "Basmati rice, cooked",
    calories: 204,
    servingSize: "1.0",
    servingUnit: "cup",
    macros: {
      protein: 4.4,
      carbs: 44.5,
      fat: 0.6,
      fiber: 0.7,
      sugar: 0.1,
    },
    isVerified: true,
    category: "grains",
  },
  {
    id: "3",
    name: "Egg",
    calories: 72,
    servingSize: "1.0",
    servingUnit: "large",
    macros: {
      protein: 6.3,
      carbs: 0.4,
      fat: 4.8,
      fiber: 0,
      sugar: 0.2,
    },
    isVerified: true,
    category: "protein",
  },
  {
    id: "4",
    name: "White rice, cooked",
    calories: 121,
    servingSize: "1.0",
    servingUnit: "cup",
    macros: {
      protein: 2.2,
      carbs: 24.9,
      fat: 0.2,
      fiber: 0.3,
      sugar: 0.1,
    },
    isVerified: true,
    category: "grains",
  },
  {
    id: "5",
    name: "Chicken breast, cooked",
    calories: 231,
    servingSize: "100",
    servingUnit: "g",
    macros: {
      protein: 43.5,
      carbs: 0,
      fat: 5.0,
      fiber: 0,
      sugar: 0,
    },
    isVerified: true,
    category: "protein",
  },
  {
    id: "6",
    name: "Broccoli, steamed",
    calories: 55,
    servingSize: "1.0",
    servingUnit: "cup",
    macros: {
      protein: 3.7,
      carbs: 11.2,
      fat: 0.6,
      fiber: 5.1,
      sugar: 2.2,
    },
    isVerified: true,
    category: "vegetables",
  },
  {
    id: "7",
    name: "Banana",
    calories: 105,
    servingSize: "1.0",
    servingUnit: "medium",
    macros: {
      protein: 1.3,
      carbs: 27.0,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14.4,
    },
    isVerified: true,
    category: "fruits",
  },
  {
    id: "8",
    name: "Salmon, grilled",
    calories: 206,
    servingSize: "100",
    servingUnit: "g",
    macros: {
      protein: 22.0,
      carbs: 0,
      fat: 12.4,
      fiber: 0,
      sugar: 0,
    },
    isVerified: true,
    category: "protein",
  },
  {
    id: "9",
    name: "Roti",
    brand: "Homemade",
    calories: 120,
    servingSize: "1.0",
    servingUnit: "medium",
    macros: {
      protein: 3.5,
      carbs: 22.0,
      fat: 2.8,
      fiber: 2.0,
      sugar: 0.5,
    },
    isVerified: true,
    category: "grains",
  },
  {
    id: "10",
    name: "Whole Wheat Chapati",
    calories: 72,
    servingSize: "0.4",
    servingUnit: "Whole",
    macros: {
      protein: 2.8,
      carbs: 15.0,
      fat: 0.8,
      fiber: 2.5,
      sugar: 0.2,
    },
    isVerified: true,
    category: "grains",
  },
  {
    id: "11",
    name: "Chapati",
    brand: "Traditional",
    calories: 104,
    servingSize: "1.0",
    servingUnit: "piece",
    macros: {
      protein: 3.1,
      carbs: 18.0,
      fat: 2.4,
      fiber: 1.9,
      sugar: 0.3,
    },
    isVerified: true,
    category: "grains",
  },
  {
    id: "12",
    name: "Almonds",
    calories: 164,
    servingSize: "28",
    servingUnit: "g",
    macros: {
      protein: 6.0,
      carbs: 6.1,
      fat: 14.2,
      fiber: 3.5,
      sugar: 1.2,
    },
    isVerified: true,
    category: "nuts",
  },
];

export const searchFoods = async (query: string): Promise<FoodItem[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!query.trim()) {
    return DUMMY_FOODS;
  }

  const lowercaseQuery = query.toLowerCase();
  return DUMMY_FOODS.filter(
    (food) =>
      food.name.toLowerCase().includes(lowercaseQuery) ||
      food.category?.toLowerCase().includes(lowercaseQuery) ||
      food.brand?.toLowerCase().includes(lowercaseQuery)
  );
};

export const getFoodById = async (id: string): Promise<FoodItem | null> => {
  const food = DUMMY_FOODS.find((f) => f.id === id);
  return food || null;
};

export const getSuggestedFoods = async (): Promise<FoodItem[]> => {
  // Return a random subset for suggestions
  const shuffled = [...DUMMY_FOODS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
};
