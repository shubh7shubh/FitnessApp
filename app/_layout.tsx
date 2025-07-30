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
import { Link } from "expo-router";

import { useAppStore } from "@/stores/appStore";
import {
  findUserByServerId,
  getActiveUser,
} from "@/db/actions/userActions";
import { seedFoodDatabase } from "@/db/actions/foodActions";
import DatabaseProvider from "@/providers/DatabaseProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import { createUser } from "@/db/actions/userActions";

// Keep the splash screen visible while we figure things out
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const {
    isLoading,
    isAuthenticated,
    setCurrentUser,
    setLoading,
    onboardingComplete,
    setOnboardingComplete,
  } = useAppStore();

  const [appInitialized, setAppInitialized] =
    useState(false);
  const [isNavigatorReady, setIsNavigatorReady] =
    useState(false);

  const [fontsLoaded, fontError] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const router = useRouter();

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const { data: authListener } =
      supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`Supabase auth event: ${event}`);

          const supabaseUser = session?.user;

          if (supabaseUser) {
            const localUser = await findUserByServerId(
              supabaseUser.id
            );

            if (localUser) {
              console.log(
                "Local user found. Welcome back!"
              );
              setCurrentUser(localUser);
              setOnboardingComplete(true);
              router.replace("/(tabs)");
            } else {
              console.log(
                "New user detected. Starting onboarding..."
              );
              useAppStore.setState({
                supabaseUser: supabaseUser,
              });

              setCurrentUser(null);
              setOnboardingComplete(false);
              router.replace("/onboarding");
            }
          } else {
            console.log("User logged out.");
            setCurrentUser(null);
            setOnboardingComplete(false);
            router.replace("/login" as any);
          }
          setIsAppReady(true);
          setAppInitialized(true);
          setLoading(false);
        }
      );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      if (isAppReady) {
        await SplashScreen.hideAsync();
        console.log("✅ Splash screen hidden.");
      }
    }
  }, [fontsLoaded, fontError, isAppReady]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigatorReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const showLoading =
    !appInitialized ||
    (!fontsLoaded && !fontError) ||
    isLoading ||
    !isNavigatorReady;

  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView
            style={{ flex: 1, backgroundColor: "black" }}
            onLayout={onLayoutRootView}
          >
            {/* Main SafeAreaView for the entire app content */}

            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="(modals)"
                options={{ presentation: "modal" }}
              />
              <Stack.Screen name="nutrition/index" />
              <Stack.Screen name="nutrition/search" />
              <Stack.Screen name="products/[id]" />
              <Stack.Screen name="user" />

              <Stack.Screen
                name="blogs"
                options={{
                  contentStyle: { paddingTop: 0 },
                  animation: "fade", // Smoother transition
                  presentation: "card",
                }}
              />
            </Stack>

            {/* Loading overlay - position it absolutely over everything */}
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
            {/* Global StatusBar from expo-status-bar */}
            <StatusBar style="light" />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}
