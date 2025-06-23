// db/schemas/userSchema.ts

import { tableSchema } from "@nozbe/watermelondb/Schema";

// This is the blueprint for our 'users' table.
export const userSchema = tableSchema({
  // This is the actual name of the table in the database.
  name: "users",

  // This is the list of columns in the 'users' table.
  columns: [
    // --- Basic Profile Fields ---
    // A column to store the user's full name. It's a 'string' (text).
    { name: "name", type: "string" },

    // A column for the user's birth date. We'll store it as text like '1995-05-20'.
    { name: "date_of_birth", type: "string" },

    // A column for the user's gender.
    { name: "gender", type: "string" },

    // --- Body Measurement Fields ---
    // A column for height. It's a 'number'.
    { name: "height_cm", type: "number" },

    // A column for weight. It's also a 'number'.
    { name: "current_weight_kg", type: "number" },

    { name: "activity_level", type: "string" }, // 'sedentary', 'lightly_active', etc.
    { name: "goal_type", type: "string" }, // 'lose', 'maintain', 'gain'
    { name: "goal_rate_kg_per_week", type: "number", isOptional: true },

    { name: "tdee", type: "number", isOptional: true },
    { name: "daily_calorie_goal", type: "number", isOptional: true },
    { name: "protein_goal_g", type: "number", isOptional: true },
    { name: "carbs_goal_g", type: "number", isOptional: true },
    { name: "fat_goal_g", type: "number", isOptional: true },

    { name: "created_at", type: "number" },
    // 'updated_at' stores the last time the record was changed.
    { name: "updated_at", type: "number" },
  ],
});
