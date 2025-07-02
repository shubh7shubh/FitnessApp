import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/modules/home/hooks/useTheme";

const { width } = Dimensions.get("window");

interface GenderAgeScreenProps {
  onDataSelect?: (data: { gender: string; age: number }) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GenderAgeScreen = ({ onDataSelect }: GenderAgeScreenProps) => {
  const { isDark } = useTheme();
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedAge, setSelectedAge] = useState<number>(25);

  // Animation values
  const maleScale = useSharedValue(1);
  const femaleScale = useSharedValue(1);
  const ageAnimation = useSharedValue(0);

  // Generate age array (18 to 80)
  const ages = Array.from({ length: 63 }, (_, i) => i + 18);
  const ageScrollRef = useRef<ScrollView>(null);

  // Theme configuration
  const theme = {
    background: isDark
      ? (["#0A0A0A", "#1A1A1A"] as const)
      : (["#F0F4FF", "#E6F2FF"] as const),
    cardBackground: isDark ? "#1F2937" : "#FFFFFF",
    selectedCardBackground: isDark ? "#10B981" : "#3B82F6",
    textPrimary: isDark ? "#FFFFFF" : "#1F2937",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textAccent: isDark ? "#10B981" : "#3B82F6",
    border: isDark ? "#374151" : "#E5E7EB",
    selectedBorder: isDark ? "#10B981" : "#3B82F6",
    shadow: isDark ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.3)",
  };

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);

    // Animate selection
    if (gender === "male") {
      maleScale.value = withSpring(1.1, { damping: 12 });
      femaleScale.value = withSpring(1, { damping: 12 });
    } else {
      femaleScale.value = withSpring(1.1, { damping: 12 });
      maleScale.value = withSpring(1, { damping: 12 });
    }

    // Trigger age animation
    ageAnimation.value = withTiming(1, { duration: 600 });

    // Call callback
    onDataSelect?.({ gender, age: selectedAge });
  };

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age);
    onDataSelect?.({ gender: selectedGender, age });
  };

  const maleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: maleScale.value }],
  }));

  const femaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: femaleScale.value }],
  }));

  const ageContainerStyle = useAnimatedStyle(() => ({
    opacity: ageAnimation.value,
    transform: [
      {
        translateY: interpolate(
          ageAnimation.value,
          [0, 1],
          [50, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const GenderCard = ({
    gender,
    emoji,
    label,
    isSelected,
    onPress,
  }: {
    gender: string;
    emoji: string;
    label: string;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <AnimatedPressable
      style={[
        gender === "male" ? maleAnimatedStyle : femaleAnimatedStyle,
        {
          width: width * 0.35,
          height: width * 0.35,
          borderRadius: width * 0.175,
          backgroundColor: isSelected
            ? theme.selectedCardBackground
            : theme.cardBackground,
          borderWidth: 3,
          borderColor: isSelected ? theme.selectedBorder : theme.border,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: 15,
          shadowColor: isSelected ? theme.shadow : "transparent",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
      ]}
      onPress={onPress}
    >
      <Text style={{ fontSize: width * 0.12 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: isSelected ? "#FFFFFF" : theme.textPrimary,
          marginTop: 8,
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );

  const AgeCard = ({
    age,
    isSelected,
    onPress,
  }: {
    age: number;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      style={{
        width: 80,
        height: 100,
        backgroundColor: isSelected
          ? theme.selectedCardBackground
          : theme.cardBackground,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 8,
        borderWidth: 2,
        borderColor: isSelected ? theme.selectedBorder : theme.border,
        shadowColor: isSelected ? theme.shadow : "transparent",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      }}
      onPress={onPress}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: isSelected ? "#FFFFFF" : theme.textPrimary,
        }}
      >
        {age}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: isSelected ? "#FFFFFF" : theme.textSecondary,
          marginTop: 4,
        }}
      >
        years
      </Text>
    </Pressable>
  );

  return (
    <LinearGradient colors={theme.background} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60 }}>
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 50 }}>
          <Text
            style={{
              fontSize: 18,
              color: theme.textSecondary,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            We celebrate every individual
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: theme.textPrimary,
              textAlign: "center",
            }}
          >
            How do you identify?
          </Text>
        </View>

        {/* Gender Selection */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 60,
          }}
        >
          <GenderCard
            gender="male"
            emoji="👨"
            label="Male"
            isSelected={selectedGender === "male"}
            onPress={() => handleGenderSelect("male")}
          />
          <GenderCard
            gender="female"
            emoji="👩"
            label="Female"
            isSelected={selectedGender === "female"}
            onPress={() => handleGenderSelect("female")}
          />
        </View>

        {/* Age Selection */}
        {selectedGender && (
          <Animated.View style={[ageContainerStyle, { flex: 1 }]}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "600",
                color: theme.textPrimary,
                textAlign: "center",
                marginBottom: 30,
              }}
            >
              Select Your Age
            </Text>

            <ScrollView
              ref={ageScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: width * 0.4,
                alignItems: "center",
              }}
              snapToInterval={96}
              decelerationRate="fast"
            >
              {ages.map((age) => (
                <AgeCard
                  key={age}
                  age={age}
                  isSelected={selectedAge === age}
                  onPress={() => handleAgeSelect(age)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Progress Indicator */}
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.selectedCardBackground,
              justifyContent: "center",
              alignItems: "center",
              opacity: selectedGender && selectedAge ? 1 : 0.3,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 24,
                fontWeight: "600",
              }}
            >
              →
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};
