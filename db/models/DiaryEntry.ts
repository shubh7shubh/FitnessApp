// db/models/DiaryEntry.ts
import { Model } from "@nozbe/watermelondb";
import {
  field,
  date,
  readonly,
  relation,
  text,
} from "@nozbe/watermelondb/decorators";
import { User } from "./User"; // Import other models for relationships
import { Food } from "./Food";

export class DiaryEntry extends Model {
  static table = "diary_entries";

  @text("date") date!: string;
  @text("meal_type") mealType!:
    | "breakfast"
    | "lunch"
    | "dinner"
    | "snacks";
  @field("servings") servings!: number;

  // These denormalized fields are for quick access
  @field("calories") calories!: number;
  @field("protein_g") protein_g!: number;
  @field("carbs_g") carbs_g!: number;
  @field("fat_g") fat_g!: number;

  @text("user_id") userId!: string;
  @text("food_id") foodId!: string;

  // --- RELATIONSHIPS ---
  // Links this entry to a User record via the 'user_id' column
  @relation("users", "user_id") user!: User;
  // Links this entry to a Food record via the 'food_id' column
  @relation("foods", "food_id") food!: Food;
}
