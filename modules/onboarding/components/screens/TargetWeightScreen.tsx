// modules/onboarding/components/screens/TargetWeightScreen.tsx

import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  G,
  Text as SvgText,
  Polygon,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

// --- Configuration ---
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = 14;
const RULER_HEIGHT = 80;
const SCROLL_DEBOUNCE_DELAY = 100; // milliseconds
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedPolygon =
  Animated.createAnimatedComponent(Polygon);

// --- Component Props ---
interface TargetWeightScreenProps {
  currentWeight: number;
  currentUnit: "kg" | "lbs";
  targetWeight: number;
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

    const {
      P0,
      P1,
      P2,
      arrowPoints,
      currentLabelPos,
      targetLabelPos,
    } = useMemo(() => {
      if (isLosingWeight) {
        // Downward curve for weight loss
        return {
          P0: { x: 60, y: 35 },
          P1: { x: 160, y: 90 },
          P2: { x: 240, y: 75 },
          arrowPoints: "0,0 -12,-6 -8,-2 -8,2 -12,6",
          currentLabelPos: { x: 12, y: 30 },
          targetLabelPos: { x: 260, y: 80 },
        };
      }
      // Upward curve for weight gain
      return {
        P0: { x: 60, y: 85 },
        P1: { x: 160, y: 30 },
        P2: { x: 240, y: 35 },
        arrowPoints: "0,0 -12,-6 -8,-2 -8,2 -12,6",
        currentLabelPos: { x: 10, y: 100 },
        targetLabelPos: { x: 250, y: 20 },
      };
    }, [isLosingWeight]);

    React.useEffect(() => {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, [targetWeight]);

    const animatedPathProps = useAnimatedProps(() => {
      const t = progress.value;
      const midX = P0.x + (P1.x - P0.x) * t;
      const midY = P0.y + (P1.y - P0.y) * t;
      const endX = P1.x + (P2.x - P1.x) * t;
      const endY = P1.y + (P2.y - P1.y) * t;
      return {
        d: `M ${P0.x} ${P0.y} Q ${midX} ${midY} ${endX} ${endY}`,
      };
    });

    const animatedFillProps = useAnimatedProps(() => {
      const t = progress.value;
      const midX = P0.x + (P1.x - P0.x) * t;
      const midY = P0.y + (P1.y - P0.y) * t;
      const endX = P1.x + (P2.x - P1.x) * t;
      const endY = P1.y + (P2.y - P1.y) * t;
      const pathD = `M ${P0.x} ${P0.y} Q ${midX} ${midY} ${endX} ${endY}`;
      const baselineY = 115;
      return {
        d: `${pathD} L ${endX} ${baselineY} L ${P0.x} ${baselineY} Z`,
      };
    });

    const animatedArrowOpacity = useAnimatedProps(() => {
      return {
        opacity:
          progress.value === 1
            ? withTiming(1, { duration: 300 })
            : 0,
      };
    });

    const gainColor = isDark ? "#FBBF24" : "#D97706";
    const lossColor = "#10B981";
    const lossArrowColor = "#F59E0B";

    const lineStroke = isLosingWeight
      ? "url(#lossLineGrad)"
      : "url(#gainLineGrad)";
    const areaFill = isLosingWeight
      ? "url(#lossAreaGrad)"
      : "url(#gainAreaGrad)";
    const arrowFill = isLosingWeight
      ? lossArrowColor
      : gainColor;

    const textColor = isDark ? "#E5E7EB" : "#374151";

    return (
      <View className="h-[140px] w-full mb-8 px-5">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 300 140"
        >
          <Defs>
            <SvgGradient
              id="lossAreaGrad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop
                offset="0%"
                stopColor="#6EE7B7"
                stopOpacity={0.4}
              />
              <Stop
                offset="100%"
                stopColor={lossColor}
                stopOpacity={0.1}
              />
            </SvgGradient>
            <SvgGradient
              id="lossLineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor="#FCD34D" />
              <Stop
                offset="100%"
                stopColor={lossArrowColor}
              />
            </SvgGradient>

            <SvgGradient
              id="gainAreaGrad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop
                offset="0%"
                stopColor="#FDE68A"
                stopOpacity={0.5}
              />
              <Stop
                offset="100%"
                stopColor={gainColor}
                stopOpacity={0.1}
              />
            </SvgGradient>
            <SvgGradient
              id="gainLineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor="#FDE68A" />
              <Stop offset="100%" stopColor={gainColor} />
            </SvgGradient>

            <SvgGradient
              id="arrowGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={arrowFill} />
              <Stop
                offset="100%"
                stopColor={arrowFill}
                stopOpacity={0.8}
              />
            </SvgGradient>
          </Defs>

          <AnimatedPath
            animatedProps={animatedFillProps}
            fill={areaFill}
          />
          <AnimatedPath
            animatedProps={animatedPathProps}
            fill="none"
            stroke={lineStroke}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <G transform={`translate(${P2.x}, ${P2.y})`}>
            <AnimatedPolygon
              points={arrowPoints}
              fill="url(#arrowGrad)"
              stroke={arrowFill}
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
              animatedProps={animatedArrowOpacity}
            />
          </G>

          <G x={currentLabelPos.x} y={currentLabelPos.y}>
            <SvgText
              fill={textColor}
              fontSize="16"
              fontWeight="bold"
              letterSpacing="0.5"
            >
              {currentWeight} {unit}
            </SvgText>
          </G>

          <G x={targetLabelPos.x} y={targetLabelPos.y}>
            <SvgText
              fill={isLosingWeight ? lossColor : gainColor}
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              {targetWeight} {unit}
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
  targetWeight,
  onTargetWeightSelect,
}: TargetWeightScreenProps) => {
  const isDark = useColorScheme() === "dark";
  const unit = currentUnit;
  const flatListRef = useRef<FlatList>(null);
  const scrollTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Local state for immediate UI updates
  const [displayWeight, setDisplayWeight] =
    useState(targetWeight);

  const rulerData = useMemo(() => {
    const min = unit === "kg" ? 30 : 66;
    const max = unit === "kg" ? 200 : 440;
    return Array.from(
      { length: max - min + 1 },
      (_, i) => i + min
    );
  }, [unit]);

  const onScroll = useCallback(
    (event: any) => {
      const newWeight =
        Math.round(
          event.nativeEvent.contentOffset.x / ITEM_WIDTH
        ) + (unit === "kg" ? 30 : 66);

      // Update display weight immediately for smooth UI
      setDisplayWeight(newWeight);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout to update the actual target weight and graph
      scrollTimeoutRef.current = setTimeout(() => {
        if (newWeight !== targetWeight) {
          onTargetWeightSelect?.({
            targetWeight: newWeight,
            unit,
          });
        }
      }, SCROLL_DEBOUNCE_DELAY);
    },
    [targetWeight, unit, onTargetWeightSelect]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Update display weight when targetWeight changes externally
  useEffect(() => {
    setDisplayWeight(targetWeight);
  }, [targetWeight]);

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
      colors={
        isDark
          ? ["#0F0F23", "#1A1A2E", "#16213E"]
          : ["#FFFFFF", "#FDEDF3", "#F9E7F7"]
      }
      className="flex-1"
    >
      <View className="flex-1 justify-center pt-[150px] pb-0">
        {/* Header */}
        <View className="items-center px-5 mb-10">
          <Text className="text-lg text-gray-500 dark:text-gray-400 tracking-wide">
            Set your
          </Text>
          <Text className="text-[28px] font-bold text-gray-800 dark:text-gray-50 mt-2 tracking-wide">
            Target Weight
          </Text>
        </View>

        {/* Graph */}
        <TargetWeightGraph
          currentWeight={currentWeight}
          targetWeight={targetWeight}
          unit={unit}
          isDark={isDark}
        />

        {/* Weight Selector */}
        <View className="w-full items-center mt-2">
          <View className="w-[90%] bg-lime-200/50 dark:bg-slate-700/80 rounded-3xl py-8 items-center shadow-lg">
            <Text className="text-[72px] font-bold text-lime-800 dark:text-emerald-200 tracking-[-2px]">
              {displayWeight}
            </Text>

            <View
              className="w-full mt-0"
              style={{ height: RULER_HEIGHT }}
            >
              <View className="w-1 h-1 bg-lime-800 dark:bg-emerald-200 rounded-full absolute self-center top-0 z-10" />
              <FlatList
                ref={flatListRef}
                data={rulerData}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal:
                    (SCREEN_WIDTH * 0.9) / 2 -
                    ITEM_WIDTH / 2,
                }}
                onScroll={onScroll}
                scrollEventThrottle={16}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                getItemLayout={getItemLayout}
                initialScrollIndex={
                  targetWeight - (unit === "kg" ? 30 : 66)
                }
                renderItem={({ item }) => {
                  const isMajorTick = item % 10 === 0;
                  const isHalfTick = item % 5 === 0;
                  return (
                    <View
                      className="items-center h-full"
                      style={{ width: ITEM_WIDTH }}
                    >
                      <View
                        className="bg-gray-600 dark:bg-gray-500"
                        style={{
                          width: isMajorTick ? 2 : 1,
                          height: isMajorTick
                            ? 40
                            : isHalfTick
                              ? 30
                              : 20,
                        }}
                      />
                      {isMajorTick && (
                        <Text className="absolute top-11 text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {item}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            </View>
            <Text className="text-xl font-semibold text-gray-600 dark:text-gray-400 mt-4 tracking-widest">
              {unit.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Bottom Message */}
        <View className="flex-row items-center p-5 rounded-2xl m-5 mt-10 "></View>
      </View>
    </LinearGradient>
  );
};
