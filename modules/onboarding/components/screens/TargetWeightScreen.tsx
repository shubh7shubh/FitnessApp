// modules/onboarding/components/screens/TargetWeightScreen.tsx

import React, { useState, useRef, useMemo, useCallback } from "react";
import { View, Text, FlatList, Dimensions, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  G,
  Text as SvgText,
  Circle,
  Polyline,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";

// --- Configuration ---
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = 14;
const RULER_HEIGHT = 80;
const AnimatedPath = Animated.createAnimatedComponent(Path);

// --- Component Props ---
interface TargetWeightScreenProps {
  currentWeight: number;
  currentUnit: "kg" | "lbs";
  onTargetWeightSelect?: (data: {
    targetWeight: number;
    unit: "kg" | "lbs";
  }) => void;
}

// --- Dynamic SVG Graph Component ---
const TargetWeightGraph = React.memo(
  ({
    currentWeight,
    targetWeight,
    unit,
    isDark,
  }: {
    currentWeight: number;
    targetWeight: number;
    unit: "kg" | "lbs";
    isDark: boolean;
  }) => {
    const isLosingWeight = targetWeight < currentWeight;
    const progress = useSharedValue(0);

    // useMemo recalculates points only when the goal direction changes
    const { P0, P1, P2, arrowRotation, currentLabelPos, targetLabelPos } =
      useMemo(() => {
        if (isLosingWeight) {
          // Downward curve for weight loss
          return {
            P0: { x: 40, y: 40 }, // Start high
            P1: { x: 120, y: 120 }, // Control point for downward arc
            P2: { x: 260, y: 100 }, // End low
            arrowRotation: -30,
            currentLabelPos: { x: 20, y: 25 },
            targetLabelPos: { x: 260, y: 115 },
          };
        }
        // Upward curve for weight gain
        return {
          P0: { x: 40, y: 100 }, // Start low
          P1: { x: 120, y: 20 }, // Control point for upward arc
          P2: { x: 260, y: 40 }, // End high
          arrowRotation: 30,
          currentLabelPos: { x: 20, y: 115 },
          targetLabelPos: { x: 260, y: 25 },
        };
      }, [isLosingWeight]);

    React.useEffect(() => {
      progress.value = 0; // Reset on change
      progress.value = withTiming(1, { duration: 600 });
    }, [targetWeight, progress]);

    const animatedFillProps = useAnimatedProps(() => {
      const t = progress.value;
      const midX = P0.x + (P1.x - P0.x) * t;
      const midY = P0.y + (P1.y - P0.y) * t;
      const endX = P1.x + (P2.x - P1.x) * t;
      const endY = P1.y + (P2.y - P1.y) * t;
      const baselineY = 115;

      return {
        d: `M ${P0.x} ${P0.y} Q ${midX} ${midY} ${endX} ${endY} L ${endX} ${baselineY} L ${P0.x} ${baselineY} Z`,
      };
    });

    const animatedStrokeProps = useAnimatedProps(() => {
      const t = progress.value;
      const midX = P0.x + (P1.x - P0.x) * t;
      const midY = P0.y + (P1.y - P0.y) * t;
      const endX = P1.x + (P2.x - P1.x) * t;
      const endY = P1.y + (P2.y - P1.y) * t;
      return {
        d: `M ${P0.x} ${P0.y} Q ${midX} ${midY} ${endX} ${endY}`,
      };
    });

    const animatedArrowOpacity = useAnimatedProps(() => {
      return {
        opacity: progress.value === 1 ? withTiming(1, { duration: 300 }) : 0,
      };
    });

    const gainColor = isDark ? "#FBBF24" : "#D97706";
    const lossColor = "#10B981";

    const lineStroke = isLosingWeight
      ? "url(#lossLineGrad)"
      : "url(#gainLineGrad)";
    const areaFill = isLosingWeight
      ? "url(#lossAreaGrad)"
      : "url(#gainAreaGrad)";
    const arrowFill = isLosingWeight ? "#F59E0B" : gainColor;

    const textColor = isDark ? "#E5E7EB" : "#374151";
    const subTextColor = isDark ? "#9CA3AF" : "#6B7280";

    return (
      <View style={{ height: 120, width: "100%", marginBottom: 20 }}>
        <Svg width="100%" height="100%" viewBox="0 0 300 120">
          <Defs>
            {/* Gradients for Weight Loss (Green) */}
            <SvgGradient id="lossAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#6EE7B7" stopOpacity={0.4} />
              <Stop offset="100%" stopColor={lossColor} stopOpacity={0.1} />
            </SvgGradient>
            <SvgGradient id="lossLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FCD34D" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </SvgGradient>

            {/* Gradients for Weight Gain (Yellow/Orange) */}
            <SvgGradient id="gainAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FDE68A" stopOpacity={0.5} />
              <Stop offset="100%" stopColor={gainColor} stopOpacity={0.1} />
            </SvgGradient>
            <SvgGradient id="gainLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FDE68A" />
              <Stop offset="100%" stopColor={gainColor} />
            </SvgGradient>
          </Defs>

          <AnimatedPath animatedProps={animatedFillProps} fill={areaFill} />
          <AnimatedPath
            animatedProps={animatedStrokeProps}
            fill="none"
            stroke={lineStroke}
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Arrow head */}
          <G x={P2.x} y={P2.y} originX="0" originY="0">
            <AnimatedPath
              d="M 0 -8 L -5 -2 L 5 -2 Z"
              fill={arrowFill}
              animatedProps={animatedArrowOpacity}
              transform={`rotate(${arrowRotation})`}
            />
          </G>

          {/* Labels */}
          <G x={currentLabelPos.x} y={currentLabelPos.y}>
            <SvgText fill={textColor} fontSize="16" fontWeight="bold">
              {currentWeight} {unit}
            </SvgText>
            <SvgText fill={subTextColor} fontSize="12" y="18">
              Current
            </SvgText>
          </G>
          <G x={targetLabelPos.x} y={targetLabelPos.y}>
            <SvgText
              fill={isLosingWeight ? lossColor : gainColor}
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              {targetWeight} {unit}
            </SvgText>
            <SvgText
              fill={subTextColor}
              fontSize="12"
              y="18"
              textAnchor="middle"
            >
              Target
            </SvgText>
          </G>
        </Svg>
      </View>
    );
  }
);

// --- Main Screen Component ---
export const TargetWeightScreen = ({
  currentWeight,
  currentUnit,
  onTargetWeightSelect,
}: TargetWeightScreenProps) => {
  const isDark = useColorScheme() === "dark";

  // For simplicity, we'll keep the unit consistent with the previous screen
  const unit = currentUnit;
  const [targetWeight, setTargetWeight] = useState(
    Math.round(currentWeight * 0.95)
  ); // Default to a 5% loss goal

  const flatListRef = useRef<FlatList>(null);

  // Generate data for the ruler
  const rulerData = useMemo(() => {
    const min = unit === "kg" ? 30 : 66;
    const max = unit === "kg" ? 200 : 440;
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }, [unit]);

  const onScroll = (event: any) => {
    const newWeight =
      Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH) +
      (unit === "kg" ? 30 : 66);
    if (newWeight !== targetWeight) {
      setTargetWeight(newWeight);
      onTargetWeightSelect?.({
        targetWeight: newWeight,
        unit,
      });
    }
  };

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH,
      offset: ITEM_WIDTH * index,
      index,
    }),
    []
  );

  return (
    <LinearGradient
      colors={isDark ? ["#111827", "#1F2937"] : ["#F3FDE8", "#EBFBEF"]}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingTop: 60,
          paddingBottom: 20,
        }}
      >
        {/* Header */}
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: isDark ? "#9CA3AF" : "#4B5563",
            }}
          >
            Set your
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: isDark ? "#F9FAFB" : "#1F2937",
              marginTop: 4,
            }}
          >
            Target Weight
          </Text>
        </View>

        {/* The Dynamic Graph */}
        <TargetWeightGraph
          currentWeight={currentWeight}
          targetWeight={targetWeight}
          unit={unit}
          isDark={isDark}
        />

        {/* Weight Picker Card */}
        <View
          style={{
            width: "100%",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: isDark
                ? "rgba(30, 41, 59, 0.8)"
                : "rgba(217, 249, 157, 0.5)",
              borderRadius: 24,
              paddingVertical: 24,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 80,
                fontWeight: "bold",
                color: isDark ? "#A7F3D0" : "#4D7C0F",
              }}
            >
              {targetWeight}
            </Text>

            <View
              style={{
                width: "100%",
                height: RULER_HEIGHT,
                marginTop: 16,
              }}
            >
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: isDark ? "#A7F3D0" : "#4D7C0F",
                  borderRadius: 2,
                  position: "absolute",
                  alignSelf: "center",
                  top: 0,
                  zIndex: 10,
                }}
              />
              <FlatList
                ref={flatListRef}
                data={rulerData}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: (SCREEN_WIDTH * 0.9) / 2 - ITEM_WIDTH / 2,
                }}
                onScroll={onScroll}
                scrollEventThrottle={16}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                getItemLayout={getItemLayout}
                initialScrollIndex={targetWeight - (unit === "kg" ? 30 : 66)}
                renderItem={({ item }) => {
                  const isMajorTick = item % 10 === 0;
                  const isHalfTick = item % 5 === 0;
                  return (
                    <View
                      style={{
                        width: ITEM_WIDTH,
                        height: "100%",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: isMajorTick ? 2 : 1,
                          height: isMajorTick ? 40 : isHalfTick ? 30 : 20,
                          backgroundColor: isDark ? "#4B5563" : "#A1A1AA",
                        }}
                      />
                      {isMajorTick && (
                        <Text
                          style={{
                            position: "absolute",
                            top: 45,
                            fontSize: 14,
                            color: isDark ? "#6B7280" : "#71717A",
                          }}
                        >
                          {item}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: isDark ? "#9CA3AF" : "#4B5563",
                marginTop: 10,
              }}
            >
              {unit.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Bottom Info Box */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#1F2937" : "#fff",
            padding: 16,
            borderRadius: 16,
            margin: 20,
            marginTop: "auto",
          }}
        >
          <Text style={{ fontSize: 32, marginRight: 12 }}>👍</Text>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: isDark ? "#F9FAFB" : "#1F2937",
              }}
            >
              Select Target Weight
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#9CA3AF" : "#4B5563",
                marginTop: 2,
                lineHeight: 20,
              }}
            >
              Choose a target that makes you feel strong, healthy and confident.
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};
