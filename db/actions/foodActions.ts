// db/actions/foodActions.ts
import { database } from "../index";
import { Food } from "../models/Food";
import { Q } from "@nozbe/watermelondb";

const foodsCollection = database.collections.get<Food>("foods");

// Our dummy food data
const DUMMY_FOODS = [
  {
    name: "Apple",
    brand: "Generic",
    calories: 95,
    protein_g: 0.5,
    carbs_g: 25,
    fat_g: 0.3,
    fiber_g: 4.0,
    servingSize: 1,
    servingUnit: "medium",
  },
  {
    name: "Chicken Breast",
    brand: "Generic",
    calories: 165,
    protein_g: 31,
    carbs_g: 0,
    fat_g: 3.6,
    fiber_g: 0,
    servingSize: 100,
    servingUnit: "g",
  },
  {
    name: "White Rice",
    brand: "Generic",
    calories: 130,
    protein_g: 2.7,
    carbs_g: 28,
    fat_g: 0.3,
    fiber_g: 0.4,
    servingSize: 100,
    servingUnit: "g cooked",
  },
  {
    name: "Whole Egg",
    brand: "Generic",
    calories: 78,
    protein_g: 6,
    carbs_g: 0.6,
    fat_g: 5,
    fiber_g: 0,
    servingSize: 1,
    servingUnit: "large",
  },
  {
    name: "Almonds",
    brand: "Generic",
    calories: 164,
    protein_g: 6,
    carbs_g: 6.1,
    fat_g: 14.2,
    fiber_g: 3.5,
    servingSize: 28,
    servingUnit: "g",
  },
  {
    name: "Olive Oil",
    brand: "Generic",
    calories: 119,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 13.5,
    fiber_g: 0,
    servingSize: 15,
    servingUnit: "ml",
  },
];

/**
 * Checks if the foods table is empty and, if so, populates it with dummy data.
 * This is a simple way to "seed" the database for new users.
 */
export const seedFoodDatabase = async () => {
  try {
    console.log("🌱 Starting food database seeding...");

    await database.write(async () => {
      console.log("📊 Checking existing food items...");
      const existingFood = await foodsCollection.query(Q.take(1)).fetch();

      if (existingFood.length > 0) {
        console.log(
          `✅ Food database already seeded with ${existingFood.length}+ items.`
        );
        return;
      }

      console.log("🌱 Seeding food database with dummy data...");
      const creations = DUMMY_FOODS.map((food) =>
        foodsCollection.prepareCreate((newFood) => {
          Object.assign(newFood, food);
        })
      );

      await database.batch(...creations);
      console.log(`✅ Successfully seeded ${creations.length} food items.`);
    });

    console.log("🎉 Food database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding food database:", error);
    // Don't throw the error, just log it to prevent app crashes
    // The app can still function without seeded food data
  }
};
