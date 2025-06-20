import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { useHomeStore } from "../store/homeStore";

export const HeroSection: React.FC = () => {
  const { colors, fitnessColors, isDark } = useTheme();
  const { todayStats } = useHomeStore();

  // Calculate calorie progress
  const caloriesRemaining =
    todayStats.caloriesGoal -
    todayStats.caloriesConsumed +
    todayStats.caloriesBurned;
  const calorieProgress =
    (todayStats.caloriesConsumed / todayStats.caloriesGoal) * 100;

  // Calculate macro progress
  const macros = [
    {
      label: "Protein",
      short: "P",
      current: todayStats.proteinConsumed,
      goal: todayStats.proteinGoal,
      percentage: (todayStats.proteinConsumed / todayStats.proteinGoal) * 100,
      color: fitnessColors.protein,
    },
    {
      label: "Carbs",
      short: "C",
      current: todayStats.carbsConsumed,
      goal: todayStats.carbsGoal,
      percentage: (todayStats.carbsConsumed / todayStats.carbsGoal) * 100,
      color: fitnessColors.carbs,
    },
    {
      label: "Fat",
      short: "F",
      current: todayStats.fatConsumed,
      goal: todayStats.fatGoal,
      percentage: (todayStats.fatConsumed / todayStats.fatGoal) * 100,
      color: fitnessColors.fat,
    },
  ];

  const renderCalorieRing = () => {
    const size = 120;
    const strokeWidth = 10;
    const innerStrokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset =
      circumference - (Math.min(calorieProgress, 100) / 100) * circumference;

    return (
      <View
        style={{
          width: size,
          height: size,
          position: "relative",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {/* Outer Glow Background */}
        <View
          style={{
            position: "absolute",
            width: size + 4,
            height: size + 4,
            borderRadius: (size + 4) / 2,
            backgroundColor: colors.primary + "08",
            top: -2,
            left: -2,
          }}
        />

        {/* Background Ring */}
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: isDark ? colors.border + "40" : colors.border + "60",
          }}
        />

        {/* Progress Ring - Multiple layers for gradient effect */}
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: "transparent",
            borderTopColor: calorieProgress <= 100 ? colors.primary : "#FF6B6B",
            borderRightColor:
              calorieProgress > 25
                ? calorieProgress <= 100
                  ? colors.primary
                  : "#FF6B6B"
                : "transparent",
            borderBottomColor:
              calorieProgress > 50
                ? calorieProgress <= 100
                  ? colors.primary
                  : "#FF6B6B"
                : "transparent",
            borderLeftColor:
              calorieProgress > 75
                ? calorieProgress <= 100
                  ? colors.primary
                  : "#FF6B6B"
                : "transparent",
            transform: [{ rotate: "-90deg" }],
          }}
        />

        {/* Inner Ring for depth */}
        <View
          style={{
            position: "absolute",
            width: size - innerStrokeWidth,
            height: size - innerStrokeWidth,
            borderRadius: (size - innerStrokeWidth) / 2,
            borderWidth: 1,
            borderColor: colors.primary + "20",
            top: innerStrokeWidth / 2,
            left: innerStrokeWidth / 2,
          }}
        />

        {/* Center Content with enhanced styling */}
        <View
          style={{
            position: "absolute",
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            top: strokeWidth,
            left: strokeWidth,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.surface,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: colors.text.primary,
                textShadowColor: colors.primary + "30",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {todayStats.caloriesConsumed.toLocaleString()}
            </Text>
            <View
              style={{
                backgroundColor: colors.primary + "15",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
                marginTop: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: colors.text.secondary,
                  fontWeight: "600",
                }}
              >
                of {(todayStats.caloriesGoal / 1000).toFixed(1)}k
              </Text>
            </View>
            <Text
              style={{
                fontSize: 9,
                color: caloriesRemaining > 0 ? colors.primary : "#FF6B6B",
                marginTop: 3,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {Math.abs(caloriesRemaining)}{" "}
              {caloriesRemaining > 0 ? "left" : "over"}
            </Text>
          </View>
        </View>

        {/* Progress indicator dot */}
        {calorieProgress > 0 && (
          <View
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                calorieProgress <= 100 ? colors.primary : "#FF6B6B",
              top: strokeWidth - 4,
              left: size / 2 - 4,
              shadowColor: calorieProgress <= 100 ? colors.primary : "#FF6B6B",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 3,
              transform: [
                {
                  translateX:
                    Math.cos(
                      (calorieProgress / 100) * 2 * Math.PI - Math.PI / 2
                    ) * radius,
                },
                {
                  translateY:
                    Math.sin(
                      (calorieProgress / 100) * 2 * Math.PI - Math.PI / 2
                    ) * radius,
                },
              ],
            }}
          />
        )}
      </View>
    );
  };

  return (
    <View
      className="mx-4 my-2 p-3 rounded-2xl"
      style={{ backgroundColor: colors.surface }}
    >
      {/* Compact Header */}
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text
            className="text-base font-semibold"
            style={{ color: colors.text.primary }}
          >
            Today's Progress
          </Text>
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity
          className="p-1.5 rounded-full"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <Ionicons
            name="notifications-outline"
            size={16}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content Row */}
      <View className="flex-row items-center justify-between">
        {/* Calorie Ring */}
        <View className="items-center">{renderCalorieRing()}</View>

        {/* Macros and Stats */}
        <View className="flex-1 ml-4">
          {/* Enhanced Macro Row */}
          <View className="flex-row justify-between mb-3">
            {macros.map((macro, index) => (
              <View key={index} className="items-center">
                {/* Macro Circle with Progress Ring */}
                <View style={{ position: "relative", marginBottom: 4 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: macro.color + "20",
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: macro.color + "40",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: macro.color,
                      }}
                    >
                      {macro.short}
                    </Text>
                  </View>

                  {/* Mini Progress Ring */}
                  <View
                    style={{
                      position: "absolute",
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: "transparent",
                      borderTopColor:
                        macro.percentage >= 25 ? macro.color : "transparent",
                      borderRightColor:
                        macro.percentage >= 50 ? macro.color : "transparent",
                      borderBottomColor:
                        macro.percentage >= 75 ? macro.color : "transparent",
                      borderLeftColor:
                        macro.percentage >= 100 ? macro.color : "transparent",
                      top: -2,
                      left: -2,
                      transform: [{ rotate: "-90deg" }],
                    }}
                  />

                  {/* Progress Dot */}
                  {macro.percentage > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: macro.color,
                        top: -2,
                        left: 16,
                        shadowColor: macro.color,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.8,
                        shadowRadius: 2,
                        elevation: 2,
                        transform: [
                          {
                            translateX:
                              Math.cos(
                                (macro.percentage / 100) * 2 * Math.PI -
                                  Math.PI / 2
                              ) * 18,
                          },
                          {
                            translateY:
                              Math.sin(
                                (macro.percentage / 100) * 2 * Math.PI -
                                  Math.PI / 2
                              ) * 18,
                          },
                        ],
                      }}
                    />
                  )}
                </View>

                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: colors.text.secondary,
                    marginBottom: 1,
                  }}
                >
                  {macro.label}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.text.primary,
                  }}
                >
                  {macro.current}g
                </Text>
                <View
                  style={{
                    backgroundColor: macro.color + "15",
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: 8,
                    marginTop: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: macro.color,
                      fontWeight: "600",
                    }}
                  >
                    {Math.round(macro.percentage)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Simple Quick Stats Row */}
          <View className="flex-row justify-around">
            <View className="flex-row items-center">
              <Ionicons name="walk" size={16} color={fitnessColors.steps} />
              <Text
                className="text-xs ml-1.5 font-medium"
                style={{ color: colors.text.secondary }}
              >
                {(todayStats.stepsCount / 1000).toFixed(1)}k steps
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="water" size={16} color={fitnessColors.water} />
              <Text
                className="text-xs ml-1.5 font-medium"
                style={{ color: colors.text.secondary }}
              >
                {(todayStats.waterConsumed / 1000).toFixed(1)}L
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="flame" size={16} color={fitnessColors.calories} />
              <Text
                className="text-xs ml-1.5 font-medium"
                style={{ color: colors.text.secondary }}
              >
                {todayStats.caloriesBurned} cal
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
