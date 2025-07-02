// db/actions/userActions.ts

import { database } from "@/db";
import { User } from "@/db/models/User";

// Get the users collection from the database
const users = database.collections.get<User>("users");

// Helper function to retry operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError!;
};

// Get the active user (we'll only have one user for now)
export async function getActiveUser(): Promise<User | null> {
  try {
    console.log("🔍 Attempting to get active user...");

    const user = await retryOperation(async () => {
      // Get the first user in the database
      const usersList = await users.query().fetch();
      console.log(`📊 Found ${usersList.length} users in database`);
      return usersList[0] || null;
    });

    console.log(
      "✅ Successfully retrieved user:",
      user ? `ID: ${user.id}` : "No user found"
    );
    return user;
  } catch (error) {
    console.error("❌ Error getting active user:", error);
    return null;
  }
}

// Create a new user
export async function createUser(userData: {
  name: string;
  dateOfBirth: string;
  gender: string;
  heightCm: number;
  currentWeightKg: number;
  activityLevel?: string;
  goalType?: string;
}): Promise<User> {
  try {
    let user: User | null = null;

    // Use a batch operation to ensure data consistency
    await database.write(async () => {
      user = await users.create((user) => {
        user.name = userData.name;
        user.dateOfBirth = userData.dateOfBirth;
        user.gender = userData.gender;
        user.heightCm = userData.heightCm;
        user.currentWeightKg = userData.currentWeightKg;
        user.activityLevel = (userData.activityLevel as any) || "sedentary";
        user.goalType = (userData.goalType as any) || "maintain";
      });
    });

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Update user data
export async function updateUser(
  user: User,
  updates: Partial<{
    name: string;
    dateOfBirth: string;
    gender: string;
    heightCm: number;
    currentWeightKg: number;
    activityLevel: string;
    goalType: string;
  }>
): Promise<User> {
  try {
    await database.write(async () => {
      await user.update((user) => {
        Object.assign(user, updates);
      });
    });
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(user: User): Promise<void> {
  try {
    await database.write(async () => {
      await user.destroyPermanently();
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
