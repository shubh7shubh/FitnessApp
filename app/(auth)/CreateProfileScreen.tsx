import React from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
} from "react-native";

import { createUser } from "@/db/actions/userActions";
import { useAppStore } from "@/stores/appStore";

export default function CreateProfileScreen() {
  console.log("🎯 CreateProfileScreen component rendered!");

  // Get the action to set the current user from our Zustand store
  const { setCurrentUser, setLoading } = useAppStore();

  // Force loading to false when component mounts
  React.useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // State to hold the form data
  const [name, setName] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [gender, setGender] = React.useState<"male" | "female" | "other">(
    "male"
  );
  const [heightCm, setHeightCm] = React.useState("");
  const [currentWeightKg, setCurrentWeightKg] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activityLevel, setActivityLevel] = React.useState("sedentary");
  const [goalType, setGoalType] = React.useState("maintain");

  // Function to handle the form submission
  const handleCreateProfile = async () => {
    // Basic validation
    if (!name || !dateOfBirth || !heightCm || !currentWeightKg) {
      Alert.alert("Missing Information", "Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Call the database action to create the user
      const newUser = await createUser({
        name,
        dateOfBirth,
        gender,
        heightCm: parseFloat(heightCm),
        currentWeightKg: parseFloat(currentWeightKg),
        activityLevel,
        goalType,
      });

      if (newUser) {
        // 2. If creation is successful, update the Zustand store
        await newUser.setupInitialGoals();
        setCurrentUser(newUser);
        console.log("User created successfully!");
      } else {
        throw new Error("User creation returned undefined.");
      }
    } catch (error) {
      console.error("Failed to create profile:", error);
      Alert.alert("Error", "Could not create your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("🎯 About to render CreateProfileScreen UI");

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center p-5">
          <Text className="text-3xl font-bold text-white text-center mb-2">
            Let's set up your profile
          </Text>

          <Text className="text-base text-gray-400 text-center mb-10">
            This helps us calculate your personalized goals.
          </Text>

          <TextInput
            className="bg-gray-800 text-white px-4 py-3 rounded-lg text-base mb-4 border border-gray-700"
            placeholder="Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            className="bg-gray-800 text-white px-4 py-3 rounded-lg text-base mb-4 border border-gray-700"
            placeholder="Date of Birth (YYYY-MM-DD)"
            placeholderTextColor="#9CA3AF"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="numeric"
          />

          <TextInput
            className="bg-gray-800 text-white px-4 py-3 rounded-lg text-base mb-4 border border-gray-700"
            placeholder="Gender (male/female/other)"
            placeholderTextColor="#9CA3AF"
            value={gender}
            onChangeText={(text) =>
              setGender(text as "male" | "female" | "other")
            }
          />

          <TextInput
            className="bg-gray-800 text-white px-4 py-3 rounded-lg text-base mb-4 border border-gray-700"
            placeholder="Height (cm)"
            placeholderTextColor="#9CA3AF"
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="numeric"
          />

          <TextInput
            className="bg-gray-800 text-white px-4 py-3 rounded-lg text-base mb-4 border border-gray-700"
            placeholder="Current Weight (kg)"
            placeholderTextColor="#9CA3AF"
            value={currentWeightKg}
            onChangeText={setCurrentWeightKg}
            keyboardType="numeric"
          />

          <TextInput
            className="bg-gray-800 text-white px-4 py-3 rounded-lg text-base mb-4 border border-gray-700"
            placeholder="Activity Level (sedentary, lightly_active, moderately_active, very_active, extra_active)"
            placeholderTextColor="#9CA3AF"
            value={activityLevel}
            onChangeText={setActivityLevel}
          />

          <TextInput
            className="bg-gray-800 text-white px-4 py-3 rounded-lg text-base mb-8 border border-gray-700"
            placeholder="Goal (lose, maintain, gain)"
            placeholderTextColor="#9CA3AF"
            value={goalType}
            onChangeText={setGoalType}
          />

          <Pressable
            onPress={handleCreateProfile}
            disabled={isSubmitting}
            className={`rounded-full p-4 mt-5 items-center ${
              isSubmitting ? "bg-gray-500" : "bg-green-500"
            }`}
          >
            <Text className="text-white text-center text-lg font-bold">
              {isSubmitting ? "Creating Profile..." : "Get Started"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
