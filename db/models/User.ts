// db/models/User.ts

import { Model } from "@nozbe/watermelondb";
import { date, readonly, text, field } from "@nozbe/watermelondb/decorators";

// The 'User' class extends WatermelonDB's Model.
// This gives it all the database powers like .update(), .destroy(), etc.
export class User extends Model {
  // This static property tells WatermelonDB that this model is connected
  // to the 'users' table in the schema. This is how they link up.
  static table = "users";

  // --- Field Decorators ---
  // The @text decorator links a string property to a database column.
  @text("name") name!: string;
  @text("date_of_birth") dateOfBirth!: string;
  @text("gender") gender!: string;
  @field("height_cm") heightCm!: number;
  @field("current_weight_kg") currentWeightKg!: number;

  // --- Special Decorators ---
  // @readonly means this field cannot be changed directly after creation.
  // @date converts the database timestamp (a number) into a JS Date object for you.
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  // --- Computed Properties (Getters) ---
  // These are not stored in the database. They are calculated live whenever you access them.
  // This is perfect for things like age.
  get age(): number | null {
    if (!this.dateOfBirth) {
      return null;
    }
    // Simple age calculation logic
    const birthDate = new Date(this.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
