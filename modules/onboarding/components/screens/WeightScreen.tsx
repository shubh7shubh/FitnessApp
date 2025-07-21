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

  // Animation values
  const kgScale = useSharedValue(1);
  const lbsScale = useSharedValue(0);
  const weightDisplayScale = useSharedValue(1);

  // Theme configuration
  const theme = {
    background: isDark
      ? (["#0F172A", "#1E293B"] as const)
      : (["#FEF3C7", "#FDE68A"] as const), // Light yellow gradient
    cardBackground: isDark ? "#2D3748" : "#FEFDE0",
    toggleBackground: isDark ? "#1E293B" : "#FFFFFF",
    selectedToggleBackground: "#68D391", // Green
    textPrimary: isDark ? "#FFFFFF" : "#2D3748",
    textSecondary: isDark ? "#A0AEC0" : "#718096",
    textAccent: isDark ? "#FEFDE0" : "#2D3748",
    border: isDark ? "#4A5568" : "#E2E8F0",
    rulerColor: isDark ? "#A0AEC0" : "#2D3748",
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

  const handleUnitToggle = useCallback(
    (unit: "kg" | "lbs") => {
      if (unit === selectedUnit) return;

      const newWeight =
        unit === "kg"
          ? Math.round(selectedWeight * 0.453592)
          : Math.round(selectedWeight * 2.20462);

      setSelectedUnit(unit);
      setSelectedWeight(newWeight);

      // Animate unit toggle
      if (unit === "kg") {
        kgScale.value = withSpring(1.05, {
          damping: 15,
          stiffness: 300,
        });
        lbsScale.value = withSpring(1, {
          damping: 15,
          stiffness: 300,
        });
      } else {
        lbsScale.value = withSpring(1.05, {
          damping: 15,
          stiffness: 300,
        });
        kgScale.value = withSpring(1, {
          damping: 15,
          stiffness: 300,
        });
      }

      // Animate weight display
      weightDisplayScale.value = withSpring(1.1, {
        damping: 20,
        stiffness: 400,
      });
      setTimeout(() => {
        weightDisplayScale.value = withSpring(1, {
          damping: 20,
          stiffness: 400,
        });
      }, 200);

      onWeightSelect?.({ weight: newWeight, unit });

      // Scroll to new weight
      const initialIndex = newWeight - weightConfig.min;
      setTimeout(() => {
        rulerRef.current?.scrollToIndex({
          index: initialIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 300);
    },
    [
      selectedUnit,
      selectedWeight,
      onWeightSelect,
      weightConfig,
    ]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollOffset =
        event.nativeEvent.contentOffset.x;
      const newWeight =
        Math.round(scrollOffset / ITEM_WIDTH) +
        weightConfig.min;

      if (
        newWeight >= weightConfig.min &&
        newWeight <= weightConfig.max
      ) {
        setSelectedWeight(newWeight);
        onWeightSelect?.({
          weight: newWeight,
          unit: selectedUnit,
        });

        // Subtle animation on weight change
        weightDisplayScale.value = withTiming(1.05, {
          duration: 100,
        });
        setTimeout(() => {
          weightDisplayScale.value = withTiming(1, {
            duration: 100,
          });
        }, 100);
      }
    },
    [weightConfig, selectedUnit, onWeightSelect]
  );

  useEffect(() => {
    const initialIndex = selectedWeight - weightConfig.min;
    if (rulerRef.current && initialIndex >= 0) {
      setTimeout(() => {
        rulerRef.current?.scrollToIndex({
          index: initialIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 200);
    }
  }, [selectedUnit, weightConfig]);

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

  const renderRulerTick = ({ item }: { item: number }) => {
    const isMain = item % 10 === 0;
    const isHalf = item % 5 === 0 && !isMain;
    return (
      <View
        style={{ width: ITEM_WIDTH, alignItems: "center" }}
      >
        <View
          style={{
            width: isMain ? 2 : 1,
            height: isMain ? 40 : isHalf ? 30 : 20,
            backgroundColor: theme.rulerColor,
            opacity: isMain ? 1 : 0.5,
          }}
        />
        {isMain && (
          <Text
            style={{
              fontSize: 12,
              color: theme.rulerColor,
              marginTop: 8,
            }}
          >
            {item}
          </Text>
        )}
      </View>
    );
  };

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
            backgroundColor: isSelected
              ? theme.selectedToggleBackground
              : "transparent",
            minWidth: 80,
            alignItems: "center",
          },
        ]}
      >
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
            Let's get to know you better
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: theme.textPrimary,
              textAlign: "center",
              letterSpacing: -0.3,
            }}
          >
            What's your Weight
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
        <View
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: 24,
            paddingVertical: 40,
            paddingHorizontal: 20,
            width: "100%",
            alignItems: "center",
            flexShrink: 1,
            justifyContent: "center",
            shadowColor: "rgba(0,0,0,0.15)",
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
              scrollEventThrottle={16}
              snapToInterval={ITEM_WIDTH}
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
        </View>

        <View style={{ flex: 1 }} />
      </View>
    </LinearGradient>
  );
};
