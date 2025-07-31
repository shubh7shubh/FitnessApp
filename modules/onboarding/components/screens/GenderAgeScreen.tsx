import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
  StatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/modules/home/hooks/useTheme";

const { width } = Dimensions.get("window");

interface GenderAgeScreenProps {
  gender: string | null;
  age: number;
  onGenderSelect: (gender: "male" | "female") => void;
  onAgeChange: (age: number) => void;
}

export const GenderAgeScreen = ({
  gender,
  age,
  onGenderSelect,
  onAgeChange,
}: GenderAgeScreenProps) => {
  const { colors, isDark } = useTheme();

  const maleScale = useSharedValue(1);
  const femaleScale = useSharedValue(1);
  const ageAnimation = useSharedValue(gender ? 1 : 0);

  // Generate age array (18 to 80)
  const ages = Array.from({ length: 63 }, (_, i) => i + 18);

  // Theme configuration using gradient color schemes
  const theme = {
    background: isDark
      ? (["#0F0F23", "#1A1A2E", "#16213E"] as const) // Dark purple gradient
      : (["#FFFFFF", "#FDF2F8", "#FCE7F3"] as const), // Light white to light pink gradient
    cardBackground: colors.surface,
    maleCardBackground: isDark
      ? (["#1E3A8A", "#3B82F6"] as const) // Dark blue gradient
      : (["#60A5FA", "#3B82F6"] as const), // Light blue gradient
    femaleCardBackground: isDark
      ? (["#BE185D", "#EC4899"] as const) // Dark pink gradient
      : (["#F472B6", "#EC4899"] as const), // Light pink gradient
    selectedCardBackground: isDark
      ? (["#10B981", "#34D399"] as const) // Dark green gradient
      : (["#34D399", "#10B981"] as const), // Light green gradient
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textAccent: colors.primary,
    border: colors.border,
    selectedBorder: colors.primary,
    shadow: isDark
      ? "rgba(74, 222, 128, 0.4)"
      : "rgba(59, 130, 246, 0.3)",
    ageCardBackground: isDark
      ? (["#1F2937", "#374151"] as const) // Dark gray gradient
      : (["#F8FAFC", "#E2E8F0"] as const), // Light gray gradient
  };

  const handleGenderSelect = useCallback(
    (selectedGender: "male" | "female") => {
      // Call parent's function to update state immediately
      onGenderSelect(selectedGender);

      // Ultra-fast, minimal animation feedback
      if (selectedGender === "male") {
        maleScale.value = withSpring(1.01, {
          damping: 12,
          stiffness: 200,
          mass: 0.3,
        });
        femaleScale.value = withSpring(1, {
          damping: 12,
          stiffness: 200,
          mass: 0.3,
        });
      } else {
        femaleScale.value = withSpring(1.01, {
          damping: 12,
          stiffness: 200,
          mass: 0.3,
        });
        maleScale.value = withSpring(1, {
          damping: 12,
          stiffness: 200,
          mass: 0.3,
        });
      }

      // Instant age section reveal
      ageAnimation.value = withTiming(1, { duration: 150 });
    },
    [onGenderSelect, maleScale, femaleScale, ageAnimation]
  );

  const handleAgeSelect = useCallback(
    (selectedAge: number) => {
      // Call parent's function to update state immediately
      onAgeChange(selectedAge);
    },
    [onAgeChange]
  );

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
          [30, 0]
        ),
      },
    ],
  }));

  const GenderCard = React.memo(
    ({
      genderType,
      imageSource,
      label,
      isSelected,
      onPress,
      animatedStyle,
    }: {
      genderType: string;
      imageSource: any;
      label: string;
      isSelected: boolean;
      onPress: () => void;
      animatedStyle: any;
    }) => {
      const cardSize = width * 0.32;
      const cardGradient = isSelected
        ? theme.selectedCardBackground
        : genderType === "male"
          ? theme.maleCardBackground
          : theme.femaleCardBackground;

      return (
        <Pressable
          onPress={onPress}
          style={{ marginHorizontal: 16 }}
        >
          <Animated.View
            style={[
              animatedStyle,
              {
                alignItems: "center",
              },
            ]}
          >
            {/* Avatar Container with Gradient */}
            <LinearGradient
              colors={cardGradient}
              style={{
                width: cardSize,
                height: cardSize,
                borderRadius: cardSize / 2,
                borderWidth: 3,
                borderColor: isSelected
                  ? theme.selectedBorder
                  : "transparent",
                overflow: "hidden",
                shadowColor: theme.shadow,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isSelected ? 0.4 : 0.2,
                shadowRadius: 16,
                elevation: isSelected ? 12 : 6,
                marginBottom: 16,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={imageSource}
                style={{
                  width: cardSize * 0.75,
                  height: cardSize * 0.75,
                }}
                resizeMode="contain"
              />
            </LinearGradient>

            {/* Label */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: isSelected
                  ? theme.selectedBorder
                  : theme.textPrimary,
                letterSpacing: 0.5,
                textAlign: "center",
              }}
            >
              {label}
            </Text>
          </Animated.View>
        </Pressable>
      );
    }
  );

  const AgeCard = React.memo(
    ({
      cardAge,
      isSelected,
      onPress,
    }: {
      cardAge: number;
      isSelected: boolean;
      onPress: () => void;
    }) => {
      const cardGradient = isSelected
        ? theme.selectedCardBackground
        : theme.ageCardBackground;

      return (
        <Pressable onPress={onPress}>
          <LinearGradient
            colors={cardGradient}
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: isSelected
                ? theme.selectedBorder
                : theme.border,
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isSelected ? 0.4 : 0.1,
              shadowRadius: 4,
              elevation: isSelected ? 6 : 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: isSelected
                  ? colors.text.inverse
                  : theme.textPrimary,
              }}
            >
              {cardAge}
            </Text>
          </LinearGradient>
        </Pressable>
      );
    }
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={theme.background}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 60,
          }}
        >
          {/* Header */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                textAlign: "center",
                marginBottom: 8,
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
              marginBottom: 50,
              paddingHorizontal: 20,
            }}
          >
            <GenderCard
              genderType="male"
              imageSource={require("@/assets/images/male.png")}
              label="Male"
              isSelected={gender === "male"}
              onPress={() => handleGenderSelect("male")}
              animatedStyle={maleAnimatedStyle}
            />
            <GenderCard
              genderType="female"
              imageSource={require("@/assets/images/female.png")}
              label="Female"
              isSelected={gender === "female"}
              onPress={() => handleGenderSelect("female")}
              animatedStyle={femaleAnimatedStyle}
            />
          </View>

          {/* Age Selection */}
          {gender && (
            <Animated.View
              style={[ageContainerStyle, { flex: 1 }]}
            >
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

              {/* Age Selection with Simple ScrollView */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  gap: 8,
                }}
                style={{
                  flexGrow: 0,
                  maxHeight: 80,
                }}
              >
                {ages.map((ageItem) => (
                  <AgeCard
                    key={ageItem}
                    cardAge={ageItem}
                    isSelected={age === ageItem}
                    onPress={() => handleAgeSelect(ageItem)}
                  />
                ))}
              </ScrollView>

              <View style={{ height: 60 }} />
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};
