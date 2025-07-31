import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
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
const ITEM_WIDTH = 14;
const RULER_PADDING = (width - ITEM_WIDTH) / 2;

interface WeightScreenProps {
  onWeightSelect?: (data: {
    weight: number;
    unit: "kg" | "lbs";
  }) => void;
}

export const WeightScreen = ({
  onWeightSelect,
}: WeightScreenProps) => {
  const { isDark } = useTheme();
  const [selectedUnit, setSelectedUnit] = useState<
    "kg" | "lbs"
  >("kg");
  const [selectedWeight, setSelectedWeight] = useState(78);
  const rulerRef = useRef<FlatList>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(
    null
  );

  // Animation values
  const kgScale = useSharedValue(1);
  const lbsScale = useSharedValue(0);
  const weightDisplayScale = useSharedValue(1);

  // Theme configuration to match other onboarding screens
  const theme = {
    background: isDark
      ? (["#0F0F23", "#1A1A2E", "#16213E"] as const) // Dark purple gradient
      : (["#FFFFFF", "#FDF2F8", "#FCE7F3"] as const), // Light white to light pink gradient
    cardBackground: isDark
      ? (["#1F2937", "#374151"] as const) // Dark gray gradient
      : (["#FFFFFF", "#F8FAFC"] as const), // Light white gradient
    toggleBackground: isDark ? "#1E293B" : "#FFFFFF",
    selectedToggleBackground: isDark
      ? (["#10B981", "#34D399"] as const) // Dark green gradient
      : (["#34D399", "#10B981"] as const), // Light green gradient
    textPrimary: isDark ? "#FFFFFF" : "#1F2937",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textAccent: isDark ? "#34D399" : "#059669",
    border: isDark ? "#374151" : "#E5E7EB",
    rulerColor: isDark ? "#9CA3AF" : "#4B5563",
    shadow: isDark
      ? "rgba(34, 197, 94, 0.4)"
      : "rgba(16, 185, 129, 0.3)",
  };

  const weightConfig = useMemo(() => {
    return selectedUnit === "kg"
      ? { min: 30, max: 200, step: 1 }
      : { min: 66, max: 440, step: 1 };
  }, [selectedUnit]);

  const weights = useMemo(() => {
    const result = [];
    for (
      let i = weightConfig.min;
      i <= weightConfig.max;
      i += weightConfig.step
    ) {
      result.push(i);
    }
    return result;
  }, [weightConfig]);

  // Function to update weight and scroll position
  const updateWeight = useCallback(
    (newWeight: number, shouldScroll: boolean = false) => {
      if (
        newWeight >= weightConfig.min &&
        newWeight <= weightConfig.max &&
        newWeight !== selectedWeight
      ) {
        setSelectedWeight(newWeight);
        onWeightSelect?.({
          weight: newWeight,
          unit: selectedUnit,
        });

        // Quick weight display animation
        weightDisplayScale.value = withSpring(1.05, {
          damping: 15,
          stiffness: 300,
        });
        setTimeout(() => {
          weightDisplayScale.value = withSpring(1, {
            damping: 15,
            stiffness: 300,
          });
        }, 150);

        // Scroll to the new weight if needed
        if (shouldScroll && rulerRef.current) {
          const index = newWeight - weightConfig.min;
          if (index >= 0 && index < weights.length) {
            rulerRef.current.scrollToIndex({
              index,
              animated: true,
              viewPosition: 0.5,
            });
          }
        }
      }
    },
    [
      weightConfig,
      selectedWeight,
      selectedUnit,
      onWeightSelect,
      weightDisplayScale,
      weights.length,
    ]
  );

  const handleUnitToggle = useCallback(
    (unit: "kg" | "lbs") => {
      if (unit === selectedUnit) return;

      // Convert weight with better precision
      const newWeight =
        unit === "kg"
          ? Math.round(selectedWeight / 2.20462)
          : Math.round(selectedWeight * 2.20462);

      setSelectedUnit(unit);

      // Quick, responsive animation feedback
      if (unit === "kg") {
        kgScale.value = withSpring(1.02, {
          damping: 12,
          stiffness: 200,
          mass: 0.3,
        });
        lbsScale.value = withSpring(1, {
          damping: 12,
          stiffness: 200,
          mass: 0.3,
        });
      } else {
        lbsScale.value = withSpring(1.02, {
          damping: 12,
          stiffness: 200,
          mass: 0.3,
        });
        kgScale.value = withSpring(1, {
          damping: 12,
          stiffness: 200,
          mass: 0.3,
        });
      }

      // Update weight after unit change
      setTimeout(() => {
        updateWeight(newWeight, true);
      }, 100);
    },
    [
      selectedUnit,
      selectedWeight,
      kgScale,
      lbsScale,
      updateWeight,
    ]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollOffset =
        event.nativeEvent.contentOffset.x;
      const exactIndex = Math.round(
        scrollOffset / ITEM_WIDTH
      );
      const newWeight = exactIndex + weightConfig.min;

      // Update weight based on scroll position
      if (
        newWeight >= weightConfig.min &&
        newWeight <= weightConfig.max &&
        newWeight !== selectedWeight
      ) {
        setSelectedWeight(newWeight);
        onWeightSelect?.({
          weight: newWeight,
          unit: selectedUnit,
        });
      }
    },
    [
      weightConfig,
      selectedUnit,
      onWeightSelect,
      selectedWeight,
    ]
  );

  const handleScrollBeginDrag = useCallback(() => {
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    // Set a timeout to mark scrolling as ended
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 100);
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrollingRef.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Ensure we're at the correct position
      const scrollOffset =
        event.nativeEvent.contentOffset.x;
      const exactIndex = Math.round(
        scrollOffset / ITEM_WIDTH
      );
      const newWeight = exactIndex + weightConfig.min;

      if (
        newWeight >= weightConfig.min &&
        newWeight <= weightConfig.max
      ) {
        updateWeight(newWeight, false);
      }
    },
    [weightConfig, updateWeight]
  );

  // Initial positioning and unit change handling
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rulerRef.current && !isScrollingRef.current) {
        const initialIndex =
          selectedWeight - weightConfig.min;
        if (
          initialIndex >= 0 &&
          initialIndex < weights.length
        ) {
          rulerRef.current.scrollToIndex({
            index: initialIndex,
            animated: false,
            viewPosition: 0.5,
          });
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    selectedUnit,
    weightConfig.min,
    weights.length,
    selectedWeight,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Animated styles
  const kgAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: kgScale.value }],
  }));

  const lbsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lbsScale.value }],
  }));

  const weightDisplayAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: weightDisplayScale.value }],
    })
  );

  const renderRulerTick = useCallback(
    ({ item }: { item: number }) => {
      const isMain = item % 10 === 0;
      const isHalf = item % 5 === 0 && !isMain;
      const isSelected = item === selectedWeight;

      return (
        <Pressable
          onPress={() => {
            if (!isScrollingRef.current) {
              updateWeight(item, true);
            }
          }}
          style={{
            width: ITEM_WIDTH,
            alignItems: "center",
            paddingVertical: 5, // Add padding for better touch area
          }}
        >
          <View
            style={{
              width: isMain ? 2 : 1,
              height: isMain ? 40 : isHalf ? 30 : 20,
              backgroundColor: isSelected
                ? theme.textAccent
                : theme.rulerColor,
              opacity: isSelected ? 1 : isMain ? 1 : 0.5,
            }}
          />
          {isMain && (
            <Text
              style={{
                fontSize: 12,
                color: isSelected
                  ? theme.textAccent
                  : theme.rulerColor,
                marginTop: 8,
                fontWeight: isSelected ? "600" : "400",
              }}
            >
              {item}
            </Text>
          )}
        </Pressable>
      );
    },
    [selectedWeight, theme, updateWeight]
  );

  const UnitToggle = ({
    unit,
    isSelected,
    animatedStyle,
  }: {
    unit: "kg" | "lbs";
    isSelected: boolean;
    animatedStyle?: any;
  }) => (
    <Pressable onPress={() => handleUnitToggle(unit)}>
      <Animated.View
        style={[
          animatedStyle,
          {
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
            minWidth: 80,
            alignItems: "center",
            overflow: "hidden",
          },
        ]}
      >
        {isSelected && (
          <LinearGradient
            colors={theme.selectedToggleBackground}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        <Text
          style={{
            color: isSelected
              ? "#FFFFFF"
              : theme.textSecondary,
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          {unit}
        </Text>
      </Animated.View>
    </Pressable>
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
            paddingTop: 60,
            alignItems: "center",
            paddingHorizontal: 20,
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
              What's your weight?
            </Text>
          </View>

          {/* Unit Toggle */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: theme.toggleBackground,
              borderRadius: 25,
              padding: 4,
              marginBottom: 40,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: "rgba(0,0,0,0.1)",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <UnitToggle
              unit="kg"
              isSelected={selectedUnit === "kg"}
              animatedStyle={kgAnimatedStyle}
            />
            <UnitToggle
              unit="lbs"
              isSelected={selectedUnit === "lbs"}
              animatedStyle={lbsAnimatedStyle}
            />
          </View>

          {/* Weight Display Container */}
          <LinearGradient
            colors={theme.cardBackground}
            style={{
              borderRadius: 24,
              paddingVertical: 40,
              paddingHorizontal: 20,
              width: "100%",
              alignItems: "center",
              flexShrink: 1,
              justifyContent: "center",
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            {/* Weight Display */}
            <Animated.View
              style={[
                weightDisplayAnimatedStyle,
                { alignItems: "center" },
              ]}
            >
              <Text
                style={{
                  fontSize: 72,
                  fontWeight: "800",
                  color: theme.textAccent,
                  marginBottom: 10,
                }}
              >
                {selectedWeight}
              </Text>
            </Animated.View>

            {/* Triangle Indicator */}
            <View
              style={{
                width: 0,
                height: 0,
                backgroundColor: "transparent",
                borderStyle: "solid",
                borderLeftWidth: 8,
                borderRightWidth: 8,
                borderBottomWidth: 12,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderBottomColor: theme.textAccent,
                marginBottom: 20,
              }}
            />

            {/* Scale */}
            <View style={{ height: 80 }}>
              <FlatList
                ref={rulerRef}
                data={weights}
                renderItem={renderRulerTick}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                onMomentumScrollEnd={
                  handleMomentumScrollEnd
                }
                scrollEventThrottle={16}
                snapToInterval={ITEM_WIDTH}
                snapToAlignment="center"
                decelerationRate="fast"
                getItemLayout={(data, index) => ({
                  length: ITEM_WIDTH,
                  offset: ITEM_WIDTH * index,
                  index,
                })}
                ListHeaderComponent={
                  <View style={{ width: RULER_PADDING }} />
                }
                ListFooterComponent={
                  <View style={{ width: RULER_PADDING }} />
                }
                contentContainerStyle={{
                  alignItems: "center",
                }}
                onScrollToIndexFailed={(info) => {
                  const wait = new Promise((resolve) =>
                    setTimeout(resolve, 500)
                  );
                  wait.then(() => {
                    rulerRef.current?.scrollToIndex({
                      index: info.index,
                      animated: true,
                      viewPosition: 0.5,
                    });
                  });
                }}
              />
            </View>

            {/* Unit Label */}
            <Text
              style={{
                fontSize: 16,
                color: theme.textAccent,
                fontWeight: "600",
                marginTop: 10,
                letterSpacing: 0.5,
              }}
            >
              {selectedUnit.toUpperCase()}
            </Text>
          </LinearGradient>

          <View style={{ flex: 1 }} />
        </View>
      </LinearGradient>
    </View>
  );
};
