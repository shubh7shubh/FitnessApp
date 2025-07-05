import "../global.css";
import { useCallback, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import {
  SplashScreen,
  Stack,
  useRouter,
} from "expo-router";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";

import { useAppStore } from "@/stores/appStore";
import { getActiveUser } from "@/db/actions/userActions";
import { seedFoodDatabase } from "@/db/actions/foodActions";
import DatabaseProvider from "@/providers/DatabaseProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

  // Local state to track initialization
  const [appInitialized, setAppInitialized] =
    useState(false);
  const [isNavigatorReady, setIsNavigatorReady] =
    useState(false);

  // Font loading
  const [fontsLoaded, fontError] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const router = useRouter();

  // --- App Initialization (separate from navigation) ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing app...");
        setLoading(true);

        // 1. Seed food database (non-blocking)
        try {
          await seedFoodDatabase();
        } catch (seedError) {
          console.warn(
            "Food database seeding failed:",
            seedError
          );
          // Don't block app initialization for seeding issues
        }

        // 2. Check for existing user
        const user = await getActiveUser();
        console.log("👤 User found:", !!user);

        // 3. Update store
        setCurrentUser(user);

        // 4. Set onboarding status
        if (user && !onboardingComplete) {
          console.log(
            "✅ User exists, marking onboarding as complete"
          );
          setOnboardingComplete(true);
        }

        console.log("✅ App initialization complete");
      } catch (error) {
        console.error(
          "❌ App initialization failed:",
          error
        );
        // Reset to a known state
        setCurrentUser(null);
        setOnboardingComplete(false);
      } finally {
        setLoading(false);
        setAppInitialized(true);
      }
    };

    // Only initialize once when fonts are ready
    if ((fontsLoaded || fontError) && !appInitialized) {
      initializeApp();
    }
  }, [fontsLoaded, fontError, appInitialized]);

  // --- Navigation Effect (Wait for navigator to be ready) ---
  useEffect(() => {
    // Wait for everything to be ready before navigating
    if (
      !appInitialized ||
      (!fontsLoaded && !fontError) ||
      isLoading ||
      !isNavigatorReady
    ) {
      return;
    }

    console.log("🧭 Navigation logic triggered:", {
      isAuthenticated,
      onboardingComplete,
      fontsLoaded: !!fontsLoaded,
      appInitialized,
      isNavigatorReady,
    });

    // Add a small delay to ensure the navigator is fully mounted
    const navigateTimeout = setTimeout(() => {
      try {
        if (isAuthenticated && onboardingComplete) {
          console.log("➡️ Going to main app");
          router.replace("/(tabs)");
        } else if (isAuthenticated && !onboardingComplete) {
          console.log("➡️ Going to onboarding");
          router.replace("/onboarding");
        } else {
          console.log("➡️ Going to profile creation");
          router.replace("/(auth)/CreateProfileScreen");
        }
      } catch (navError) {
        console.error("❌ Navigation error:", navError);
        // Fallback navigation
        router.replace("/(auth)/CreateProfileScreen");
      }
    }, 300); // Increased delay to ensure navigator is ready

    return () => clearTimeout(navigateTimeout);
  }, [
    appInitialized,
    isAuthenticated,
    onboardingComplete,
    fontsLoaded,
    fontError,
    isLoading,
    isNavigatorReady,
  ]);

  // --- Hide Splash Screen Logic ---
  const onLayoutRootView = useCallback(async () => {
    if (
      (fontsLoaded || fontError) &&
      appInitialized &&
      !isLoading
    ) {
      try {
        await SplashScreen.hideAsync();
        console.log("✅ Splash screen hidden");
      } catch (error) {
        console.warn("⚠️ Splash screen hide error:", error);
      }
    }
  }, [fontsLoaded, fontError, appInitialized, isLoading]);

  // Android Navigation Bar
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  // Mark navigator as ready after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigatorReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state
  const showLoading =
    !appInitialized ||
    (!fontsLoaded && !fontError) ||
    isLoading ||
    !isNavigatorReady;

  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView
              className="flex-1 bg-black"
              onLayout={onLayoutRootView}
            >
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)/CreateProfileScreen" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="(modals)"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen name="nutrition/index" />
                <Stack.Screen name="nutrition/search" />
                <Stack.Screen name="products/[id]" />
                <Stack.Screen name="user/[id]" />
              </Stack>

              {/* Loading overlay with better error handling */}
              {showLoading && (
                <View className="absolute inset-0 bg-black flex-1 justify-center items-center">
                  <ActivityIndicator
                    size="large"
                    color="#10B981"
                  />
                  <Text className="text-white mt-4 text-center px-4">
                    {fontError
                      ? "Font loading failed, continuing..."
                      : !fontsLoaded
                        ? "Loading fonts..."
                        : !appInitialized
                          ? "Initializing app..."
                          : !isNavigatorReady
                            ? "Setting up navigation..."
                            : "Starting FitNext..."}
                  </Text>
                  {fontError && (
                    <Text className="text-red-400 mt-2 text-sm">
                      Font Error: {fontError.message}
                    </Text>
                  )}
                </View>
              )}
            </SafeAreaView>

            <StatusBar style="light" />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}
