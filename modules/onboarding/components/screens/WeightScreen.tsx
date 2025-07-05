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
import { useTheme } from "@/modules/home/hooks/useTheme";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = 12;
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

      onWeightSelect?.({ weight: newWeight, unit });
    },
    [selectedUnit, selectedWeight, onWeightSelect]
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
            backgroundColor: isDark ? "#A0AEC0" : "#2D3748",
            opacity: isMain ? 1 : 0.5,
          }}
        />
        {isMain && (
          <Text
            style={{
              fontSize: 12,
              color: isDark ? "#A0AEC0" : "#2D3748",
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
  }: {
    unit: "kg" | "lbs";
    isSelected: boolean;
  }) => (
    <Pressable
      onPress={() => handleUnitToggle(unit)}
      style={{
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: isSelected
          ? "#68D391"
          : "transparent",
        minWidth: 80,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: isSelected
            ? "#FFFFFF"
            : isDark
              ? "#A0AEC0"
              : "#718096",
          fontWeight: "600",
          fontSize: 16,
        }}
      >
        {unit}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: "transparent" }}
    >
      <View
        style={{
          flex: 1,
          paddingTop: 60,
          alignItems: "center",
        }}
      >
        {/* Header */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 40,
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: isDark ? "#A0AEC0" : "#718096",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Let's get to know you better
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: isDark ? "#FFFFFF" : "#2D3748",
              textAlign: "center",
            }}
          >
            What's your Weight
          </Text>
        </View>

        {/* Unit Toggle */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 25,
            padding: 4,
            marginBottom: 40,
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? "#4A5568" : "transparent",
          }}
        >
          <UnitToggle
            unit="kg"
            isSelected={selectedUnit === "kg"}
          />
          <UnitToggle
            unit="lbs"
            isSelected={selectedUnit === "lbs"}
          />
        </View>

        {/* Weight Display Container */}
        <View
          style={{
            backgroundColor: isDark ? "#2D3748" : "#FEFDE0",
            borderRadius: 24,
            paddingVertical: 40,
            width: "100%",
            alignItems: "center",
            flexShrink: 1,
            justifyContent: "center",
          }}
        >
          {/* Weight Display */}
          <Text
            style={{
              fontSize: 72,
              fontWeight: "bold",
              color: isDark ? "#FEFDE0" : "#2D3748",
              marginBottom: 10,
            }}
          >
            {selectedWeight}
          </Text>

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
              borderBottomColor: isDark
                ? "#FEFDE0"
                : "#2D3748",
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
              color: isDark ? "#FEFDE0" : "#2D3748",
              fontWeight: "600",
              marginTop: 10,
            }}
          >
            {selectedUnit.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};
