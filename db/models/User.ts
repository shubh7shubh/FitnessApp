// db/models/User.ts

import { Model } from "@nozbe/watermelondb";
import { date, readonly, text, field } from "@nozbe/watermelondb/decorators";

// The 'User' class extends WatermelonDB's Model.
// This gives it all the database powers like .update(), .destroy(), etc.

type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";
type GoalType = "lose" | "maintain" | "gain";
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

  @text("activity_level") activityLevel!: ActivityLevel;
  @text("goal_type") goalType!: GoalType;
  @field("goal_rate_kg_per_week")
  goalRateKgPerWeek?: number;

  @field("tdee") tdee?: number;
  @field("daily_calorie_goal") dailyCalorieGoal?: number;
  @field("protein_goal_g") proteinGoal_g?: number;
  @field("carbs_goal_g") carbsGoal_g?: number;
  @field("fat_goal_g") fatGoal_g?: number;

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

  calculateBMR(): number {
    if (!this.age || !this.heightCm || !this.currentWeightKg) return 0;

    // Mifflin-St Jeor Equation
    const bmr =
      this.gender === "male"
        ? 10 * this.currentWeightKg + 6.25 * this.heightCm - 5 * this.age + 5
        : 10 * this.currentWeightKg + 6.25 * this.heightCm - 5 * this.age - 161;

    return Math.round(bmr);
  }

  calculateTDEE(): number {
    const bmr = this.calculateBMR();
    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
    };
    return Math.round(bmr * multipliers[this.activityLevel]);
  }

  async setupInitialGoals(): Promise<void> {
    const tdee = this.calculateTDEE();
    let dailyCalorieGoal = tdee;

    // Adjust calories based on goal
    if (this.goalType === "lose") {
      dailyCalorieGoal = tdee - 500; // 500 calorie deficit
    } else if (this.goalType === "gain") {
      dailyCalorieGoal = tdee + 500; // 500 calorie surplus
    }

    // Calculate macros (simple 30% protein, 40% carbs, 30% fat)
    const proteinGoal = Math.round((dailyCalorieGoal * 0.3) / 4);
    const carbsGoal = Math.round((dailyCalorieGoal * 0.4) / 4);
    const fatGoal = Math.round((dailyCalorieGoal * 0.3) / 9);

    await this.update(() => {
      this.tdee = tdee;
      this.dailyCalorieGoal = dailyCalorieGoal;
      this.proteinGoal_g = proteinGoal;
      this.carbsGoal_g = carbsGoal;
      this.fatGoal_g = fatGoal;
      this.goalRateKgPerWeek = this.goalType === "maintain" ? 0 : 0.5;
    });
  }
}
