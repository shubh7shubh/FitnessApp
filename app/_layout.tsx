// app/_layout.tsx

import "../global.css";
import { useCallback, useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Slot, Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

// --- Our New Imports ---
import { useAppStore } from "@/stores/appStore";
import { getActiveUser } from "@/db/actions/userActions";
import { seedFoodDatabase } from "@/db/actions/foodActions";
import CreateProfileScreen from "./(auth)/CreateProfileScreen";
import DatabaseProvider from "@/providers/DatabaseProvider";

// Keep the splash screen visible while we figure things out
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // --- State from our Zustand store ---
  const { isLoading, isAuthenticated, setCurrentUser, setLoading } =
    useAppStore();

  // Font loading
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  // --- The Gatekeeper Logic ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Check the database for an existing user
        await seedFoodDatabase(); // Seed the food database if needed
        const user = await getActiveUser();

        // 2. Update our Zustand store with the result
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to initialize app:", e);
        // Handle error, maybe set user to null
        setCurrentUser(null);
      } finally {
        // 3. We're done loading, tell the store
        setLoading(false);
      }
    };

    initializeApp();
  }, []); // The empty dependency array ensures this runs only once on app start

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

  // While fonts are loading or we are checking the database, keep showing nothing
  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <DatabaseProvider>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-black" onLayout={onLayoutRootView}>
          {isAuthenticated ? (
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(modals)" options={{ headerShown: false }} />
            </Stack>
          ) : (
            <CreateProfileScreen />
          )}
        </SafeAreaView>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </DatabaseProvider>
  );
}
