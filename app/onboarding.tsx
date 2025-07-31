import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  SafeAreaView,
  Pressable,
  Text,
  StatusBar,
} from "react-native";
import PagerView from "react-native-pager-view";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { GenderAgeScreen } from "@/modules/onboarding/components/screens/GenderAgeScreen";
import { WeightScreen } from "@/modules/onboarding/components/screens/WeightScreen";
import { TargetWeightScreen } from "@/modules/onboarding/components/screens/TargetWeightScreen";
import { GoalScreen } from "@/modules/onboarding/components/screens/GoalScreen";
import { useAppStore } from "@/stores/appStore";
import { createUser } from "@/db/actions/userActions";
import { useTheme } from "@/modules/home/hooks/useTheme";

const AnimatedCircle =
  Animated.createAnimatedComponent(Circle);

interface NextButtonProps {
  progress: number;
  onPress: () => void;
  disabled: boolean;
}

const NextButton = ({
  progress,
  onPress,
  disabled,
}: NextButtonProps) => {
  const { colors, isDark } = useTheme();
  const CIRCLE_LENGTH = 2 * Math.PI * 28;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(
      CIRCLE_LENGTH - CIRCLE_LENGTH * progress,
      {
        duration: 250,
      }
    ),
  }));

  const buttonGradient = disabled
    ? isDark
      ? (["#374151", "#4B5563"] as const)
      : (["#E5E7EB", "#D1D5DB"] as const)
    : isDark
      ? (["#10B981", "#34D399"] as const)
      : (["#34D399", "#10B981"] as const);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        opacity: disabled ? 0.5 : 1,
        shadowColor: disabled
          ? "rgba(0,0,0,0.1)"
          : colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: disabled ? 0.1 : 0.4,
        shadowRadius: 16,
        elevation: disabled ? 4 : 12,
      }}
    >
      <LinearGradient
        colors={buttonGradient}
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Svg
          width="72"
          height="72"
          style={{ position: "absolute" }}
        >
          <Circle
            cx="36"
            cy="36"
            r="28"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="3"
            fill="transparent"
          />
          <AnimatedCircle
            cx="36"
            cy="36"
            r="28"
            stroke="#FFFFFF"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={CIRCLE_LENGTH}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
          />
        </Svg>
        <Feather
          name="arrow-right"
          size={24}
          color="#FFFFFF"
          style={{ marginLeft: 2 }}
        />
      </LinearGradient>
    </Pressable>
  );
};

export default function OnboardingFlow() {
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);

  const {
    setOnboardingComplete,
    supabaseUser,
    setCurrentUser,
  } = useAppStore();

  // --- Consolidated State ---
  // A single source of truth for all onboarding data.
  const [onboardingData, setOnboardingData] = useState({
    gender: null as "male" | "female" | null,
    age: 25,
    weight: 78,
    weightUnit: "kg" as "kg" | "lbs",
    targetWeight: 72,
    targetWeightUnit: "kg" as "kg" | "lbs",
    goal: "lose_weight",
    // NOTE: These are not collected in the current UI.
    // We are providing defaults to allow user creation.
    // You should add screens to collect this data from the user.
    heightCm: 175,
    activityLevel: "sedentary" as
      | "sedentary"
      | "lightly_active"
      | "moderately_active"
      | "very_active",
  });

  // Gradient theme configuration to match GenderAgeScreen
  const backgroundColors = isDark
    ? (["#0F0F23", "#1A1A2E", "#16213E"] as const) // Dark purple gradient
    : (["#FFFFFF", "#FDF2F8", "#FCE7F3"] as const); // Light white to light pink gradient

  const handleGenderSelect = useCallback(
    (gender: "male" | "female") => {
      setOnboardingData((prev) => ({ ...prev, gender }));
    },
    []
  );

  const handleAgeChange = useCallback((age: number) => {
    setOnboardingData((prev) => ({ ...prev, age }));
  }, []);

  const handleWeightSelect = useCallback(
    (data: { weight: number; unit: "kg" | "lbs" }) => {
      setOnboardingData((prev) => ({
        ...prev,
        weight: data.weight,
        weightUnit: data.unit,
      }));
    },
    []
  );

  const handleTargetWeightSelect = useCallback(
    (data: {
      targetWeight: number;
      unit: "kg" | "lbs";
    }) => {
      setOnboardingData((prev) => ({
        ...prev,
        targetWeight: data.targetWeight,
        targetWeightUnit: data.unit,
      }));
    },
    []
  );

  const handleGoalSelect = useCallback((goal: string) => {
    setOnboardingData((prev) => ({ ...prev, goal }));
  }, []);

  const onboardingSteps = useMemo(
    () => [
      <GenderAgeScreen
        key="gender-age"
        gender={onboardingData.gender}
        age={onboardingData.age}
        onGenderSelect={handleGenderSelect}
        onAgeChange={handleAgeChange}
      />,
      <WeightScreen
        key="weight"
        onWeightSelect={handleWeightSelect}
      />,
      <TargetWeightScreen
        key="target-weight"
        currentWeight={onboardingData.weight}
        currentUnit={onboardingData.weightUnit}
        targetWeight={onboardingData.targetWeight}
        onTargetWeightSelect={handleTargetWeightSelect}
      />,
      <GoalScreen
        key="goal"
        onGoalSelect={handleGoalSelect}
      />,
    ],
    [
      onboardingData.gender,
      onboardingData.age,
      onboardingData.weight,
      onboardingData.targetWeight,
    ]
  );

  const totalPages = onboardingSteps.length;
  const progress = (currentPage + 1) / totalPages;

  const handleFinishOnboarding = async () => {
    if (!supabaseUser) {
      console.error(
        "Cannot complete onboarding without a Supabase user."
      );
      // Optionally, navigate back to login
      router.replace("/login");
      return;
    }

    // Convert weights to KG if they are in LBS
    const currentWeightInKg =
      onboardingData.weightUnit === "lbs"
        ? onboardingData.weight * 0.453592
        : onboardingData.weight;

    const targetWeightInKg =
      onboardingData.targetWeightUnit === "lbs"
        ? onboardingData.targetWeight * 0.453592
        : onboardingData.targetWeight;

    // Approximate date of birth from age
    const birthYear =
      new Date().getFullYear() - onboardingData.age;
    const dateOfBirth = `${birthYear}-01-01`;

    const userData = {
      server_id: supabaseUser.id,
      email: supabaseUser.email,
      name:
        supabaseUser.user_metadata.full_name || "New User",
      gender: onboardingData.gender!,
      dateOfBirth: dateOfBirth,
      heightCm: onboardingData.heightCm,
      currentWeightKg: Math.round(currentWeightInKg),
      goalType: onboardingData.goal,
      activityLevel: onboardingData.activityLevel,
      targetWeightKg: Math.round(targetWeightInKg),
    };

    try {
      console.log("Creating user with data:", userData);
      const newUser = await createUser(userData);
      console.log(
        "Successfully created user in WatermelonDB:",
        newUser?.id
      );

      // Now that the user is created, finish the process
      if (newUser) {
        setCurrentUser(newUser);
        setOnboardingComplete(true);
        router.replace("/(tabs)");
      } else {
        console.error(
          "Failed to create user: createUser returned undefined"
        );
        // Handle the error case - maybe show an alert or stay on onboarding
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      // You should show an error message to the user here
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      // This is the last page, finish onboarding
      handleFinishOnboarding();
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
    }
  };

  const canProceed = () => {
    if (currentPage === 0) {
      return onboardingData.gender !== null;
    }
    if (currentPage === 1) {
      return onboardingData.weight > 0;
    }
    if (currentPage === 2) {
      return onboardingData.targetWeight > 0;
    }
    if (currentPage === 3) {
      return onboardingData.goal !== "";
    }
    return false;
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={backgroundColors}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Screen options={{ headerShown: false }} />

          {/* Page Content */}
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            scrollEnabled={false}
            onPageSelected={(e) =>
              setCurrentPage(e.nativeEvent.position)
            }
          >
            {onboardingSteps.map((step, index) => (
              <View key={index} style={{ flex: 1 }}>
                {step}
              </View>
            ))}
          </PagerView>

          {/* --- REFINED NAVIGATION BUTTONS --- */}
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
                  borderWidth: 2,
                  borderColor: colors.border,
                  shadowColor: "rgba(0,0,0,0.1)",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={
                    isDark
                      ? (["#374151", "#4B5563"] as const)
                      : (["#FFFFFF", "#F8FAFC"] as const)
                  }
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Back
                </Text>
              </Pressable>
            ) : (
              // Spacer
              <View />
            )}

            <NextButton
              progress={progress}
              onPress={goToNextPage}
              disabled={!canProceed()}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
