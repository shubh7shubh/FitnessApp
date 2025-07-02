import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
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
  onDataSelect?: (data: {
    gender: string;
    age: number;
  }) => void;
}

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

export const GenderAgeScreen = ({
  onDataSelect,
}: GenderAgeScreenProps) => {
  const { isDark } = useTheme();
  const [selectedGender, setSelectedGender] =
    useState<string>("");
  const [selectedAge, setSelectedAge] =
    useState<number>(25);

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
      ? (["#0F172A", "#1E293B"] as const)
      : (["#FDF2F8", "#FCE7F3"] as const), // Light pink gradient for light mode
    cardBackground: isDark ? "#1E293B" : "#FFFFFF",
    maleCardBackground: "#DBEAFE", // Light blue for male
    femaleCardBackground: "#FCE7F3", // Light pink for female
    selectedCardBackground: isDark ? "#10B981" : "#3B82F6",
    textPrimary: isDark ? "#FFFFFF" : "#1F2937",
    textSecondary: isDark ? "#94A3B8" : "#6B7280",
    textAccent: isDark ? "#10B981" : "#3B82F6",
    border: isDark ? "#334155" : "#E5E7EB",
    selectedBorder: isDark ? "#10B981" : "#3B82F6",
    shadow: isDark
      ? "rgba(16, 185, 129, 0.4)"
      : "rgba(59, 130, 246, 0.4)",
  };

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);

    // Immediate response with minimal animation
    if (gender === "male") {
      maleScale.value = withSpring(1.02, {
        damping: 15,
        stiffness: 300,
        mass: 0.5,
      });
      femaleScale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
        mass: 0.5,
      });
    } else {
      femaleScale.value = withSpring(1.02, {
        damping: 25,
        stiffness: 500,
        mass: 0.3,
      });
      maleScale.value = withSpring(1, {
        damping: 25,
        stiffness: 500,
        mass: 0.3,
      });
    }

    // Immediate age section reveal
    ageAnimation.value = withTiming(1, { duration: 150 });

    // Call callback immediately
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
          [30, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const GenderCard = ({
    gender,
    imageSource,
    label,
    isSelected,
    onPress,
    animatedStyle,
  }: {
    gender: string;
    imageSource: any;
    label: string;
    isSelected: boolean;
    onPress: () => void;
    animatedStyle?: any;
  }) => {
    const cardSize = width * 0.35;
    const cardBackground =
      gender === "male"
        ? theme.maleCardBackground
        : theme.femaleCardBackground;

    return (
      <Pressable onPressIn={() => onPress()}>
        <View
          style={[
            animatedStyle,
            {
              alignItems: "center",
              marginHorizontal: 20,
            },
          ]}
        >
          {/* Perfect Circle Avatar */}
          <View
            style={{
              width: cardSize,
              height: cardSize,
              borderRadius: cardSize / 2,
              backgroundColor: isSelected
                ? theme.selectedCardBackground
                : cardBackground,
              borderWidth: 4,
              borderColor: isSelected
                ? theme.selectedBorder
                : "rgba(255,255,255,0.3)",
              overflow: "hidden",
              shadowColor: isSelected
                ? theme.shadow
                : "rgba(0,0,0,0.15)",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isSelected ? 0.4 : 0.2,
              shadowRadius: 20,
              elevation: isSelected ? 15 : 8,
              marginBottom: 12,
            }}
          >
            <Image
              source={imageSource}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
            />
          </View>

          {/* Label */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: isSelected
                ? theme.selectedCardBackground
                : theme.textPrimary,
              letterSpacing: 0.5,
              textAlign: "center",
            }}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  };

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
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: isSelected
          ? theme.selectedBorder
          : theme.border,
        shadowColor: isSelected
          ? theme.shadow
          : "rgba(0,0,0,0.1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isSelected ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: isSelected ? 8 : 2,
      }}
      onPressIn={() => onPress()}
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: "800",
          color: isSelected ? "#FFFFFF" : theme.textPrimary,
        }}
      >
        {age}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: isSelected
            ? "rgba(255,255,255,0.8)"
            : theme.textSecondary,
          marginTop: 4,
        }}
      >
        years
      </Text>
    </Pressable>
  );

  return (
    <LinearGradient
      colors={theme.background}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 40,
        }}
      >
        {/* Header */}
        <View
          style={{ alignItems: "center", marginBottom: 50 }}
        >
          <Text
            style={{
              fontSize: 16,
              color: theme.textSecondary,
              textAlign: "center",
              marginBottom: 12,
              fontWeight: "500",
              letterSpacing: 0.5,
            }}
          >
            Tell us about yourself
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: theme.textPrimary,
              textAlign: "center",
              letterSpacing: -0.5,
            }}
          >
            Who are you?
          </Text>
        </View>

        {/* Gender Selection */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 60,
            paddingHorizontal: 20,
          }}
        >
          <GenderCard
            gender="male"
            imageSource={require("@/assets/images/male.png")}
            label="Male"
            isSelected={selectedGender === "male"}
            onPress={() => handleGenderSelect("male")}
            animatedStyle={maleAnimatedStyle}
          />
          <GenderCard
            gender="female"
            imageSource={require("@/assets/images/female.png")}
            label="Female"
            isSelected={selectedGender === "female"}
            onPress={() => handleGenderSelect("female")}
            animatedStyle={femaleAnimatedStyle}
          />
        </View>

        {/* Age Selection */}
        {selectedGender && (
          <View style={[ageContainerStyle, { flex: 1 }]}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: theme.textPrimary,
                textAlign: "center",
                marginBottom: 30,
                letterSpacing: -0.3,
              }}
            >
              How old are you?
            </Text>

            <ScrollView
              ref={ageScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 20,
                paddingRight: 20,
                alignItems: "center",
              }}
              snapToInterval={96}
              decelerationRate="fast"
              style={{ flexGrow: 0, marginHorizontal: -24 }}
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

            <View style={{ height: 40 }} />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};
