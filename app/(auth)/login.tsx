import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { FontAwesome5 } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function LoginScreen() {
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "542017148278-ikemudde0t4iujnafp7lrlicuvthupt4.apps.googleusercontent.com",
    });
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  async function signInWithGoogle() {
    setIsLoading(true);
    try {
      // 1. Check if the device has Google Play Services installed (for Android).
      await GoogleSignin.hasPlayServices();

      // 2. Trigger the native Google Sign-In UI to get the user's ID token.
      const signInResult = await GoogleSignin.signIn();
      console.log("Sign-in result:", signInResult);
      const { idToken } = await GoogleSignin.getTokens();

      console.log("ID token:", idToken);

      if (!idToken) {
        throw new Error("Google Sign-In failed: No ID token was returned.");
      }

      // 3. Use the received ID token to sign in with Supabase.
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        // If Supabase returns an error, throw it to be caught below.
        throw error;
      }

      // If we reach here, the sign-in was successful.
      // The `onAuthStateChange` listener in your RootLayout will now take over
      // and handle the rest of the logic (checking WatermelonDB, navigation, etc.).
      console.log("✅ Successfully signed in with Supabase:", data.user?.email);
    } catch (error: any) {
      if (error.code === "SIGN_IN_CANCELLED") {
        // This is a normal event, not an error.
        console.log("User cancelled the Google Sign-In flow.");
      } else {
        // For all other errors, show an alert.
        console.error("Authentication error:", error);
        Alert.alert(
          "Sign-in Error",
          "Could not sign in with Google. Please try again."
        );
      }
    } finally {
      // Always ensure the loading state is turned off.
      setIsLoading(false);
    }
  }

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // This ensures the user doesn't need email confirmation in development
            emailRedirectTo: undefined,
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          Alert.alert(
            "Account Created!",
            data.user.email_confirmed_at
              ? "You can now sign in with your credentials."
              : "Please check your email for a confirmation link, then try signing in.",
            [{ text: "OK", onPress: () => setIsSignUp(false) }]
          );
          console.log("✅ Successfully signed up:", data.user.email);
        }
      } else {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Provide more specific error messages
          if (error.message.includes("Invalid login credentials")) {
            throw new Error(
              "Invalid email or password. Please check your credentials or sign up if you don't have an account."
            );
          }
          if (error.message.includes("Email not confirmed")) {
            throw new Error(
              "Please check your email and confirm your account before signing in."
            );
          }
          throw error;
        }

        console.log("✅ Successfully signed in with email:", data.user?.email);
      }
    } catch (error: any) {
      console.error("Email authentication error:", error);
      Alert.alert(
        isSignUp ? "Sign Up Error" : "Sign In Error",
        error.message || "Could not authenticate. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center bg-gray-900 p-6">
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar
          barStyle="light-content"
          backgroundColor="#111827"
          translucent={false}
        />

        <View className="items-center mb-12">
          <Text className="text-5xl font-extrabold text-white">FitNext</Text>
          <Text className="text-lg text-gray-400 mt-3">
            Your ultimate fitness partner
          </Text>
        </View>

        <View className="w-full space-y-4 mb-6">
          <TextInput
            className="w-full p-4 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-blue-500"
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            className="w-full p-4 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-blue-500"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            onPress={signInWithEmail}
            disabled={isLoading}
            className={`w-full p-4 rounded-xl ${
              isLoading ? "bg-gray-600" : "bg-blue-600 active:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold text-center">
                {isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
            className="w-full p-2"
          >
            <Text className="text-blue-400 text-center">
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center w-full mb-6">
          <View className="flex-1 h-px bg-gray-600" />
          <Text className="text-gray-500 px-4">OR</Text>
          <View className="flex-1 h-px bg-gray-600" />
        </View>

        <Pressable
          onPress={signInWithGoogle}
          disabled={isLoading}
          className={`w-full flex-row items-center justify-center p-4 rounded-xl transition-all duration-200
          ${isLoading ? "bg-gray-600" : "bg-white active:bg-gray-200"}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#1F2937" />
          ) : (
            <>
              <FontAwesome5 name="google" size={20} color="#1F2937" />
              <Text className="text-gray-900 text-lg font-bold ml-4">
                Sign in with Google
              </Text>
            </>
          )}
        </Pressable>

        <Text className="text-gray-600 text-xs text-center mt-8 px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
