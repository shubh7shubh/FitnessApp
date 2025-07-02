import React, { useRef, useState } from "react";
import { View, SafeAreaView, Pressable, Text } from "react-native";
import PagerView from "react-native-pager-view";
import { Stack, useRouter } from "expo-router";

import { GenderAgeScreen } from "@/modules/onboarding/components/screens/GenderAgeScreen";
import { GoalScreen } from "@/modules/onboarding/components/screens/GoalScreen";
import { useAppStore } from "@/stores/appStore";

const OnboardingProgressBar = ({ progress }: { progress: number }) => (
  <View className="h-1 bg-gray-700 rounded-full mx-6">
    <View
      style={{ width: `${progress * 100}%` }}
      className="h-1 bg-blue-500 rounded-full"
    />
  </View>
);

export default function OnboardingFlow() {
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string>("lose_weight");
  const [genderAgeData, setGenderAgeData] = useState<{
    gender: string;
    age: number;
  }>({
    gender: "",
    age: 25,
  });
  const { setOnboardingComplete, setSelectedGoal: setStoreGoal } =
    useAppStore();

  const handleGenderAgeSelect = (data: { gender: string; age: number }) => {
    setGenderAgeData(data);
    console.log("Gender and Age selected:", data);
  };

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    console.log("Goal selected:", goal);
  };

  const onboardingSteps = [
    <GenderAgeScreen key="gender-age" onDataSelect={handleGenderAgeSelect} />,
    <GoalScreen key="goal" onGoalSelect={handleGoalSelect} />,
  ];

  const totalPages = onboardingSteps.length;

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      // This is the last page, finish onboarding
      console.log("Onboarding Complete!", {
        genderAge: genderAgeData,
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
      return selectedGoal !== "";
    }
    return false;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Progress Bar */}
      <View className="my-4">
        <OnboardingProgressBar progress={(currentPage + 1) / totalPages} />
      </View>

      {/* Page Content */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        scrollEnabled={false}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {onboardingSteps.map((step, index) => (
          <View key={index} className="flex-1">
            {step}
          </View>
        ))}
      </PagerView>

      {/* Navigation Buttons */}
      <View className="flex-row justify-between items-center px-6 py-4">
        {currentPage > 0 ? (
          <Pressable
            onPress={goToPreviousPage}
            className="flex-row items-center px-4 py-2"
          >
            <Text className="text-gray-400 text-base">← Back</Text>
          </Pressable>
        ) : (
          <View />
        )}

        <Pressable
          onPress={goToNextPage}
          disabled={!canProceed()}
          className={`px-8 py-4 rounded-full ${
            canProceed() ? "bg-blue-500" : "bg-gray-600"
          }`}
        >
          <Text className="text-white text-center text-lg font-bold">
            {currentPage === totalPages - 1 ? "Finish" : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
