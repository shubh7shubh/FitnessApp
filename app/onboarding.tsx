import React, { useRef, useState, useCallback, useMemo } from "react";
import { View, SafeAreaView, Pressable, Text } from "react-native";
import PagerView from "react-native-pager-view";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { GenderAgeScreen } from "@/modules/onboarding/components/screens/GenderAgeScreen";
import { WeightScreen } from "@/modules/onboarding/components/screens/WeightScreen";
import { TargetWeightScreen } from "@/modules/onboarding/components/screens/TargetWeightScreen";
import { GoalScreen } from "@/modules/onboarding/components/screens/GoalScreen";
import { useAppStore } from "@/stores/appStore";
import { useTheme } from "@/modules/home/hooks/useTheme";

export default function OnboardingFlow() {
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string>("lose_weight");
  const [genderAgeData, setGenderAgeData] = useState<{
    gender: string;
    age: number;
  }>({
    gender: "",
    age: 25,
  });
  const [weightData, setWeightData] = useState<{
    weight: number;
    unit: "kg" | "lbs";
  }>({
    weight: 78,
    unit: "kg",
  });
  const [targetWeightData, setTargetWeightData] = useState<{
    targetWeight: number;
    unit: "kg" | "lbs";
  }>({
    targetWeight: 72,
    unit: "kg",
  });
  const { setOnboardingComplete, setSelectedGoal: setStoreGoal } =
    useAppStore();

  // Theme configuration to match GenderAgeScreen
  const backgroundColors = isDark
    ? (["#0F172A", "#1E293B"] as const)
    : (["#FFFFFF", "#FDF2F8"] as const); // White to light pink

  const handleGenderAgeSelect = useCallback(
    (data: { gender: string; age: number }) => {
      setGenderAgeData(data);
      console.log("Gender and Age selected:", data);
    },
    []
  );

  const handleWeightSelect = useCallback(
    (data: { weight: number; unit: "kg" | "lbs" }) => {
      setWeightData(data);
      console.log("Weight selected:", data);
    },
    []
  );

  const handleTargetWeightSelect = useCallback(
    (data: { targetWeight: number; unit: "kg" | "lbs" }) => {
      setTargetWeightData(data);
      console.log("Target weight selected:", data);
    },
    []
  );

  const handleGoalSelect = useCallback((goal: string) => {
    setSelectedGoal(goal);
    console.log("Goal selected:", goal);
  }, []);

  const onboardingSteps = useMemo(
    () => [
      <GenderAgeScreen key="gender-age" onDataSelect={handleGenderAgeSelect} />,
      <WeightScreen key="weight" onWeightSelect={handleWeightSelect} />,
      <TargetWeightScreen
        key="target-weight"
        currentWeight={weightData.weight}
        currentUnit={weightData.unit}
        onTargetWeightSelect={handleTargetWeightSelect}
      />,
      <GoalScreen key="goal" onGoalSelect={handleGoalSelect} />,
    ],
    [
      handleGenderAgeSelect,
      handleWeightSelect,
      handleTargetWeightSelect,
      handleGoalSelect,
      weightData,
    ]
  );

  const totalPages = onboardingSteps.length;

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      // This is the last page, finish onboarding
      console.log("Onboarding Complete!", {
        genderAge: genderAgeData,
        weight: weightData,
        targetWeight: targetWeightData,
        goal: selectedGoal,
      });

      // Save the selected goal to the store
      setStoreGoal(selectedGoal);
      setOnboardingComplete(true);

      // Navigate to the main app
      router.replace("/(tabs)");
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
    }
  };

  const canProceed = () => {
    if (currentPage === 0) {
      return genderAgeData.gender !== "";
    }
    if (currentPage === 1) {
      return weightData.weight > 0;
    }
    if (currentPage === 2) {
      return targetWeightData.targetWeight > 0;
    }
    if (currentPage === 3) {
      return selectedGoal !== "";
    }
    return false;
  };

  return (
    <LinearGradient colors={backgroundColors} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Page Content */}
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={false}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          {onboardingSteps.map((step, index) => (
            <View key={index} style={{ flex: 1 }}>
              {step}
            </View>
          ))}
        </PagerView>

        {/* Navigation Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 32,
            paddingVertical: 24,
          }}
        >
          {currentPage > 0 ? (
            <Pressable
              onPress={goToPreviousPage}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 30,
                backgroundColor: isDark ? "#374151" : "rgba(255,255,255,0.8)",
                borderWidth: 2,
                borderColor: isDark ? "#4B5563" : "rgba(59, 130, 246, 0.3)",
                shadowColor: "rgba(0,0,0,0.1)",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: isDark ? "#D1D5DB" : "#374151",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                ← Back
              </Text>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            onPress={goToNextPage}
            disabled={!canProceed()}
            style={{
              paddingHorizontal: 40,
              paddingVertical: 16,
              borderRadius: 30,
              backgroundColor: canProceed() ? "#68D391" : "#9CA3AF",
              opacity: canProceed() ? 1 : 0.5,
              shadowColor: canProceed()
                ? "rgba(104, 211, 145, 0.4)"
                : "rgba(0,0,0,0.1)",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: canProceed() ? 0.4 : 0.1,
              shadowRadius: 16,
              elevation: canProceed() ? 12 : 4,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                textAlign: "center",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              {currentPage === totalPages - 1 ? "Finish" : "Next"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
