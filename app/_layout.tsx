import "../global.css";
import { useCallback, useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Platform, View, ActivityIndicator, Text } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

import { useAppStore } from "@/stores/appStore";
import { getActiveUser } from "@/db/actions/userActions";
import { seedFoodDatabase } from "@/db/actions/foodActions";
import DatabaseProvider from "@/providers/DatabaseProvider";

// Keep the splash screen visible while we figure things out
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // --- State from our Zustand store ---
  const {
    isLoading,
    isAuthenticated,
    setCurrentUser,
    setLoading,
    onboardingComplete,
    setOnboardingComplete,
  } = useAppStore();

  // Font loading
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const router = useRouter();

  // --- The Gatekeeper Logic ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing app...");
        // 1. Check the database for an existing user
        await seedFoodDatabase(); // Seed the food database if needed
        const user = await getActiveUser();
        console.log("User found:", !!user);

        // 2. Update our Zustand store with the result
        setCurrentUser(user);

        // 3. If user exists, assume onboarding is complete (they went through profile creation)
        if (user && !onboardingComplete) {
          console.log("User exists, marking onboarding as complete");
          setOnboardingComplete(true);
        }
      } catch (e) {
        console.error("Failed to initialize app:", e);
        // Handle error, maybe set user to null
        setCurrentUser(null);
      } finally {
        // 4. We're done loading, tell the store
        setLoading(false);
      }
    };

    if (fontsLoaded) {
      initializeApp();
    }
  }, [fontsLoaded]); // Only run when fonts are loaded

  useEffect(() => {
    if (!fontsLoaded || isLoading) return; // Wait until both fonts and initial check are done

    console.log(
      "Navigation logic - Auth:",
      isAuthenticated,
      "Onboarding:",
      onboardingComplete
    );

    // Simple navigation logic
    if (isAuthenticated) {
      if (onboardingComplete) {
        console.log("Going to main app");
        router.replace("/(tabs)");
      } else {
        console.log("Going to onboarding");
        router.replace("/onboarding");
      }
    } else {
      console.log("Going to profile creation");
      router.replace("/(auth)/CreateProfileScreen");
    }
  }, [isLoading, isAuthenticated, onboardingComplete, fontsLoaded]);

  // --- Hide Splash Screen Logic ---
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  // Android Navigation Bar
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  return (
    <DatabaseProvider>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-black" onLayout={onLayoutRootView}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/CreateProfileScreen" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
            <Stack.Screen name="nutrition/index" />
            <Stack.Screen name="nutrition/search" />
            <Stack.Screen name="products/[id]" />
            <Stack.Screen name="user/[id]" />
          </Stack>

          {/* Show loading overlay if still loading */}
          {(!fontsLoaded || isLoading) && (
            <View className="absolute inset-0 bg-black flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#10B981" />
              <Text className="text-white mt-4">
                {!fontsLoaded ? "Loading fonts..." : "Initializing app..."}
              </Text>
            </View>
          )}
        </SafeAreaView>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </DatabaseProvider>
  );
}
