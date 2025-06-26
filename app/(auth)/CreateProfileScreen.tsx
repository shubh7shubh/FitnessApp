import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import { createUser } from "@/db/actions/userActions";
import { useAppStore } from "@/stores/appStore";

export default function CreateProfileScreen() {
  // Get the action to set the current user from our Zustand store
  const { setCurrentUser } = useAppStore();

  // State to hold the form data
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); // e.g., '1990-01-15'
  const [gender, setGender] = useState<
    "male" | "female" | "other"
  >("male");
  const [heightCm, setHeightCm] = useState("");
  const [currentWeightKg, setCurrentWeightKg] =
    useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityLevel, setActivityLevel] =
    useState("sedentary");
  const [goalType, setGoalType] = useState("maintain");

  // Function to handle the form submission
  const handleCreateProfile = async () => {
    // Basic validation
    if (
      !name ||
      !dateOfBirth ||
      !heightCm ||
      !currentWeightKg
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill out all fields."
      );
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
        // This will trigger the RootLayout to switch to the main app!
        await newUser.setupInitialGoals();
        setCurrentUser(newUser);
      } else {
        throw new Error(
          "User creation returned undefined."
        );
      }
    } catch (error) {
      console.error("Failed to create profile:", error);
      Alert.alert(
        "Error",
        "Could not create your profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Let's set up your profile
      </Text>
      <Text style={styles.subtitle}>
        This helps us calculate your personalized goals.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        placeholderTextColor="#888"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        keyboardType="numeric"
      />
      {/* A proper gender selector (Picker or custom buttons) would be better here,
          but TextInput is fine for this first step. */}
      <TextInput
        style={styles.input}
        placeholder="Gender (male/female/other)"
        placeholderTextColor="#888"
        value={gender}
        onChangeText={(text) =>
          setGender(text as "male" | "female" | "other")
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        placeholderTextColor="#888"
        value={heightCm}
        onChangeText={setHeightCm}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Current Weight (kg)"
        placeholderTextColor="#888"
        value={currentWeightKg}
        onChangeText={setCurrentWeightKg}
        keyboardType="numeric"
      />

      {/* In a real app, these would be custom Picker or SegmentedControl components */}
      <TextInput
        style={styles.input}
        placeholder="Activity Level (sedentary, lightly_active...)"
        value={activityLevel}
        onChangeText={setActivityLevel}
      />
      <TextInput
        style={styles.input}
        placeholder="Goal (lose, maintain, gain)"
        value={goalType}
        onChangeText={setGoalType}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={
            isSubmitting
              ? "Creating Profile..."
              : "Get Started"
          }
          onPress={handleCreateProfile}
          disabled={isSubmitting}
          color="#10B981" // A nice green color
        />
      </View>
    </ScrollView>
  );
}

// A simple StyleSheet for styling. You can replace this with NativeWind classes.
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#121212", // Dark background
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0A0",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonContainer: {
    marginTop: 20,
  },
});
