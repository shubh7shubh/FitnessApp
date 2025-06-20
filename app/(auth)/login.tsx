import { useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";

export default function login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("OAuth error:", error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* BRAND SECTION */}
      <View className="items-center mt-20">
        <View className="w-[60px] h-[60px] rounded-[18px] bg-primary/[.15] justify-center items-center mb-5">
          <Ionicons name="leaf" size={32} color="#4ADE80" />
        </View>
        <Text className="text-[42px] font-bold font-jetbrains-mono text-primary tracking-[0.5px] mb-2">
          fitness
        </Text>
        <Text className="text-base text-grey tracking-wider lowercase">
          don't miss anything
        </Text>
      </View>

      {/* ILLUSTRATION */}
      <View className="flex-1 justify-center items-center px-10">
        <Image
          source={require("../../assets/images/auth-bg-2.png")}
          className="w-full aspect-square max-h-[280px]"
          resizeMode="cover"
        />
      </View>

      {/* LOGIN SECTION */}
      <View className="w-full px-6 pb-10 items-center">
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white py-4 px-6 rounded-[14px] mb-5 w-full max-w-[300px] shadow-lg"
          onPress={handleGoogleSignIn}
          activeOpacity={0.9}
        >
          <View className="w-6 h-6 justify-center items-center mr-3">
            <Ionicons name="logo-google" size={20} color="#1A1A1A" />
          </View>
          <Text className="text-base font-semibold text-surface">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-xs text-grey max-w-[280px]">
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
