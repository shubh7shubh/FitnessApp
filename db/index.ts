// db/index.ts

import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

// Import the master schema and all the models we've defined.
import { myAppSchema } from "./schemas/index";
import { User } from "./models/User";
import { Food } from "./models/Food";
import { DiaryEntry } from "./models/DiaryEntry";

// --- Step 1: Create the Adapter ---
// The adapter is the bridge between WatermelonDB's logic and the
// native SQLite database on the phone.
const adapter = new SQLiteAdapter({
  schema: myAppSchema,
  // We recommend using JSI for better performance on modern RN versions.
  jsi: true,
  // The name of the database file that will be created on the user's device.
  dbName: "myfitnessapp.db",
  // A function that is called if the database fails to open.
  // This is a good place for logging errors.
  onSetUpError: (error) => {
    console.error("WatermelonDB setup failed:", error);
  },
});

// --- Step 2: Create the Database Instance ---
// We create a new Database object, passing it the adapter and a list
// of all the model classes it needs to be aware of.
export const database = new Database({
  adapter,
  modelClasses: [User, Food, DiaryEntry],
});
