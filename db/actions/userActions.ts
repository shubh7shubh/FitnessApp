import { database } from "@/db";
import { User } from "@/db/models/User";
import { Q } from "@nozbe/watermelondb";

// Get the users collection from the database
const users = database.collections.get<User>("users");

interface UserCreationData {
  server_id: string;
  email?: string;
  name: string;
  avatar_url?: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  heightCm: number;
  currentWeightKg: number;
  goalType: string;
  activityLevel: string;
  targetWeightKg: number;
}

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
      lastError =
        error instanceof Error
          ? error
          : new Error(String(error));
      console.warn(
        `Attempt ${attempt} failed:`,
        lastError.message
      );

      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * attempt)
        );
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
      console.log(
        `📊 Found ${usersList.length} users in database`
      );
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
export const createUser = async (
  profile: UserCreationData
) => {
  let newUser: User | undefined;

  await database.write(async () => {
    newUser = await database.collections
      .get<User>("users")
      .create((user) => {
        user.serverId = profile.server_id;
        user.email = profile.email || "";
        user.name = profile.name;
        user.avatarUrl = profile.avatar_url;
        user.gender = profile.gender;
        user.dateOfBirth = profile.dateOfBirth;
        user.heightCm = profile.heightCm;
        user.currentWeightKg = profile.currentWeightKg;
        user.goalType = profile.goalType;
        user.activityLevel = profile.activityLevel;
        user.goalWeightKg = profile.targetWeightKg;
      });
  });

  return newUser;
};

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
export async function deleteUser(
  user: User
): Promise<void> {
  try {
    await database.write(async () => {
      await user.destroyPermanently();
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

//Find user by supabaseId

export const findUserByServerId = async (
  serverId: string
): Promise<User | null> => {
  const usersCollection =
    database.collections.get<User>("users");
  const users = await usersCollection
    .query(Q.where("server_id", serverId))
    .fetch();
  return users.length > 0 ? users[0] : null;
};
