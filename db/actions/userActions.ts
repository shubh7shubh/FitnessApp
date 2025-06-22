// db/actions/userActions.ts

import { database } from "@/db";
import { User } from "@/db/models/User";

// Get the users collection from the database
const users = database.collections.get<User>("users");

// Get the active user (we'll only have one user for now)
export async function getActiveUser(): Promise<User | null> {
  try {
    // Get the first user in the database
    const user = await users.query().fetch();
    return user[0] || null;
  } catch (error) {
    console.error("Error getting active user:", error);
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
