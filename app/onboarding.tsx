import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  SafeAreaView,
  Pressable,
  Text,
  BackHandler,
  useColorScheme,
  Alert,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useOnboardingStore } from "@/modules/onboarding/store";
import { WelcomeScreen } from "@/modules/onboarding/components/screens/WelcomeScreen";
import { GenderScreen } from "@/modules/onboarding/components/screens/GenderScreen";
import { MetricsScreen } from "@/modules/onboarding/components/screens/MetricsScreen";
import { ActivityLevelScreen } from "@/modules/onboarding/components/screens/ActivityLevelScreen";
import { GoalScreen } from "@/modules/onboarding/components/screens/GoalScreen";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/useUserStore";
import { createUser, updateUser } from "@/db/actions/userActions";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/providers/ToastProvider";

// Multi-step progress indicator with subtle animation
const StepProgress = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => {
  const isDark = useColorScheme() === "dark";
  const segments = useMemo(() => Array.from({ length: total }), [total]);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      {segments.map((_, idx) => (
        <Animated.View
          key={idx}
          entering={FadeInDown.duration(300).delay(idx * 80)}
          style={{
            marginTop: 20,
            height: 10,
            width: idx === current ? 42 : 28,
            borderRadius: 999,
            backgroundColor:
              idx === current
                ? isDark
                  ? "#4F46E5"
                  : "#3B82F6"
                : isDark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(0,0,0,0.08)",
            opacity: idx === current ? 1 : 0.6,
          }}
        />
      ))}
    </View>
  );
};

export default function OnboardingFlow() {
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();
  const { edit } = useLocalSearchParams();
  const isEditMode = edit === "true";
  const isDark = useColorScheme() === "dark";
  const [currentPage, setCurrentPage] = useState(0);
  const onboardingState = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, setCurrentUser, setOnboardingComplete } = useAppStore();
  const { setUserData } = useUserStore();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const { showToast } = useToast();

  // Get current user on mount and pre-populate if editing
  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    getUser();

    // Pre-populate onboarding state if editing existing user
    if (isEditMode && currentUser) {
      onboardingState.setData({
        gender: currentUser.gender as any,
        age: currentUser.age,
        heightCm: currentUser.heightCm,
        currentWeightKg: currentUser.currentWeightKg,
        activityLevel: currentUser.activityLevel as any,
        goalType: currentUser.goalType as any,
        targetWeightKg: currentUser.goalWeightKg || undefined,
      });
    }
  }, [isEditMode, currentUser]);

  const canProceed = () => {
    switch (currentPage) {
      case 0: // Welcome screen
        return true;
      case 1: // Gender screen
        return onboardingState.gender !== null;
      case 2: // Metrics
        return (
          onboardingState.age !== null &&
          onboardingState.age > 0 &&
          onboardingState.heightCm !== null &&
          onboardingState.heightCm > 0 &&
          onboardingState.currentWeightKg !== null &&
          onboardingState.currentWeightKg > 0
        );
      case 3: // Activity Level
        return onboardingState.activityLevel !== null;
      case 4: // Goal
        return onboardingState.goalType !== null;

      default:
        return true;
    }
  };

  // Define the sequence of our onboarding screens
  const onboardingSteps = [
    WelcomeScreen,
    GenderScreen,
    MetricsScreen,
    ActivityLevelScreen,
    GoalScreen,
  ];

  const totalPages = onboardingSteps.length;

  const goToPage = (pageIndex: number) => {
    pagerRef.current?.setPage(pageIndex);
  };

  const handleNext = async () => {
    if (currentPage < totalPages - 1) {
      // If not on the last page, just go to the next one
      goToPage(currentPage + 1);
    } else {
      // --- THIS IS THE "FINISH SETUP" LOGIC ---
      if (!supabaseUser && !isEditMode) {
        Alert.alert(
          "Authentication Error",
          "Your session could not be found. Please log in again."
        );
        router.replace("/(auth)/login");
        return;
      }

      setIsSubmitting(true);
      try {
        if (isEditMode && currentUser) {
          // Update existing user
          const updates = {
            gender: onboardingState.gender!,
            age: onboardingState.age,
            heightCm: onboardingState.heightCm!,
            currentWeightKg: onboardingState.currentWeightKg!,
            activityLevel: onboardingState.activityLevel!,
            goalType: onboardingState.goalType!,
            targetWeightKg:
              onboardingState.targetWeightKg || currentUser.goalWeightKg,
            // Calculate dateOfBirth from age
            dateOfBirth: onboardingState.age
              ? new Date(
                  new Date().setFullYear(
                    new Date().getFullYear() - onboardingState.age
                  )
                )
                  .toISOString()
                  .split("T")[0]
              : currentUser.dateOfBirth,
          };

          console.log("🔄 Updating user with critical changes:", updates);
          console.log(
            "📅 Age being set:",
            onboardingState.age,
            "-> Date of birth:",
            updates.dateOfBirth
          );
          const updatedUser = await updateUser(currentUser, updates);

          // Update both stores with the new user data
          setCurrentUser(updatedUser);
          setUserData(updatedUser);

          console.log("✅ User updated successfully with new goals:", {
            dailyCalorieGoal: updatedUser.dailyCalorieGoal,
            proteinGoal_g: updatedUser.proteinGoal_g,
            carbsGoal_g: updatedUser.carbsGoal_g,
            fatGoal_g: updatedUser.fatGoal_g,
          });

          // Navigate back to profile with success
          router.back();
          showToast("Your profile has been updated successfully!", "success");
        } else {
          // Create new user (original flow)
          const finalProfileData = {
            server_id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name || "Fitness User",
            gender: onboardingState.gender!,
            dateOfBirth: onboardingState.age
              ? new Date(
                  new Date().setFullYear(
                    new Date().getFullYear() - onboardingState.age
                  )
                )
                  .toISOString()
                  .split("T")[0]
              : new Date(new Date().setFullYear(new Date().getFullYear() - 25))
                  .toISOString()
                  .split("T")[0], // Fallback to age 25 if no age provided
            heightCm: onboardingState.heightCm!,
            currentWeightKg: onboardingState.currentWeightKg!,
            targetWeightKg:
              onboardingState.targetWeightKg ||
              onboardingState.currentWeightKg!,
            activityLevel: onboardingState.activityLevel!,
            goalType: onboardingState.goalType!,
          };

          const newUser = await createUser(finalProfileData);

          if (newUser) {
            // Update both stores with the new user data
            setCurrentUser(newUser);
            setUserData(newUser);
            setOnboardingComplete(true);
            router.replace("/(tabs)");
          } else {
            throw new Error(
              "Failed to create the user profile in the database."
            );
          }
        }
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
        Alert.alert(
          "Error",
          `There was a problem ${isEditMode ? "updating" : "saving"} your profile. Please try again.`
        );
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
    return true; // Prevent default Android back behavior
  };

  // Handle the Android hardware back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack
    );
    return () => backHandler.remove();
  }, [currentPage]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated step progress at top */}
      <View className="mt-6 mb-4">
        <StepProgress current={currentPage} total={totalPages} />
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        scrollEnabled={false} // User must use the buttons
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {onboardingSteps.map((StepComponent, index) => (
          <Animated.View
            key={index}
            className="flex-1 px-6 pb-4"
            entering={FadeInUp.duration(350)}
          >
            <StepComponent />
          </Animated.View>
        ))}
      </PagerView>

      {/* Footer with Back + Continue */}
      <View className="px-6 pb-6 pt-3 border-t border-gray-200 dark:border-gray-800">
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleBack}
            disabled={currentPage === 0 || isSubmitting}
            style={{ flex: 1, opacity: currentPage === 0 ? 0.5 : 1 }}
          >
            <View className="rounded-2xl p-4 bg-gray-200 dark:bg-slate-800 flex-row justify-center items-center">
              <Feather
                name="arrow-left"
                size={18}
                color={isDark ? "#E5E7EB" : "#1F2937"}
              />
              <Text
                className="ml-2 text-base font-semibold"
                style={{ color: isDark ? "#E5E7EB" : "#1F2937" }}
              >
                Back
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleNext}
            disabled={!canProceed() || isSubmitting}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={isDark ? ["#22C55E", "#10B981"] : ["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="text-base font-bold" style={{ color: "white" }}>
                {isSubmitting
                  ? "Please wait..."
                  : currentPage === totalPages - 1
                    ? isEditMode
                      ? "Save Changes"
                      : "Finish Setup"
                    : "Continue"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
