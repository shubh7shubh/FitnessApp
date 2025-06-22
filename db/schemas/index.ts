// db/schemas/index.ts

import { appSchema } from "@nozbe/watermelondb/Schema";
import { userSchema } from "./userSchema"; // Import the user blueprint we just made

// This is the master schema for our entire application.
export const myAppSchema = appSchema({
  // The version number is very important. Any time you change the schema
  // (e.g., add a new column to users), you MUST increase this number.
  // This tells WatermelonDB to update the database structure on the user's device.
  version: 1,

  // This is the list of all tables in our database. For now, it's just one.
  tables: [userSchema],
});
