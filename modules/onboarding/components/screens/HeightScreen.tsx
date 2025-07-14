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
  StyleSheet,
  ListRenderItemInfo,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useTheme } from "@/modules/home/hooks/useTheme";

const { width } = Dimensions.get("window");

// Picker Constants
const PICKER_ITEM_HEIGHT = 50;
const PICKER_VISIBLE_ITEMS = 7;
const PICKER_WIDTH = 120;

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<number>
);

interface HeightScreenProps {
  onHeightSelect?: (data: {
    height: number;
    unit: "cm" | "ft/in";
  }) => void;
}

const WheelPicker = ({
  data,
  onSelect,
  initialValue,
  label,
  isDark,
}: {
  data: number[];
  onSelect: (value: number) => void;
  initialValue: number;
  label: string;
  isDark: boolean;
}) => {
  const pickerRef = useRef<FlatList<number>>(null);
  const scrollY = useSharedValue(0);

  const initialIndex = useMemo(
    () => Math.max(0, data.indexOf(initialValue)),
    [data, initialValue]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const yOffset = event.nativeEvent.contentOffset.y;
      const index = Math.round(
        yOffset / PICKER_ITEM_HEIGHT
      );
      const clampedIndex = Math.max(
        0,
        Math.min(index, data.length - 1)
      );
      onSelect(data[clampedIndex]);

      if (pickerRef.current) {
        pickerRef.current.scrollToIndex({
          index: clampedIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }
    },
    [data, onSelect]
  );

  useEffect(() => {
    if (pickerRef.current) {
      // Use a timeout to ensure the list has rendered before scrolling.
      setTimeout(() => {
        pickerRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
          viewPosition: 0.5,
        });
      }, 50);
    }
  }, [initialIndex]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<number>) => {
      const animatedStyle = useAnimatedStyle(() => {
        const itemOffset = index * PICKER_ITEM_HEIGHT;
        const distance = Math.abs(
          scrollY.value - itemOffset
        );

        // Opacity: Full at center, fades out
        const opacity = interpolate(
          distance,
          [0, PICKER_ITEM_HEIGHT * 2],
          [1, 0.3],
          Extrapolate.CLAMP
        );

        // Scale: Full size at center, shrinks away
        const scale = interpolate(
          distance,
          [0, PICKER_ITEM_HEIGHT * 2],
          [1, 0.8],
          Extrapolate.CLAMP
        );

        return { opacity, transform: [{ scale }] };
      });

      return (
        <Animated.View
          style={[
            styles.pickerItemContainer,
            animatedStyle,
          ]}
        >
          <Text
            style={[
              styles.pickerItemText,
              { color: isDark ? "#E0F7FA" : "#083344" },
            ]}
          >
            {item} {label}
          </Text>
        </Animated.View>
      );
    },
    [isDark, label]
  );

  return (
    <View style={styles.pickerColumn}>
      <View style={styles.selectionIndicator} />
      <AnimatedFlatList
        ref={pickerRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.toString()}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        initialNumToRender={21}
        maxToRenderPerBatch={21}
        windowSize={21}
        contentContainerStyle={{
          paddingVertical:
            Math.floor(PICKER_VISIBLE_ITEMS / 2) *
            PICKER_ITEM_HEIGHT,
        }}
        getItemLayout={(_, index) => ({
          length: PICKER_ITEM_HEIGHT,
          offset: PICKER_ITEM_HEIGHT * index,
          index,
        })}
        style={styles.pickerFlatList}
      />
      <LinearGradient
        colors={[
          isDark
            ? "rgba(8, 51, 68, 1)"
            : "rgba(224, 247, 250, 1)",
          "transparent",
        ]}
        style={[
          styles.gradient,
          { top: 0, height: PICKER_ITEM_HEIGHT * 2 },
        ]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[
          "transparent",
          isDark
            ? "rgba(8, 51, 68, 1)"
            : "rgba(224, 247, 250, 1)",
        ]}
        style={[
          styles.gradient,
          { bottom: 0, height: PICKER_ITEM_HEIGHT * 2 },
        ]}
        pointerEvents="none"
      />
    </View>
  );
};

export const HeightScreen = ({
  onHeightSelect,
}: HeightScreenProps) => {
  const { isDark } = useTheme();
  const [selectedUnit, setSelectedUnit] = useState<
    "cm" | "ft/in"
  >("ft/in");

  const [cmHeight, setCmHeight] = useState(178);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(10);
  const [pickerKey, setPickerKey] = useState(0);

  const cmConfig = useMemo(
    () => ({ min: 120, max: 220, step: 1 }),
    []
  );
  const cmHeights = useMemo(() => {
    const result = [];
    for (
      let i = cmConfig.min;
      i <= cmConfig.max;
      i += cmConfig.step
    ) {
      result.push(i);
    }
    return result;
  }, [cmConfig]);

  const ftConfig = useMemo(() => ({ min: 3, max: 8 }), []);
  const ftValues = useMemo(() => {
    const result = [];
    for (let i = ftConfig.min; i <= ftConfig.max; i++)
      result.push(i);
    return result;
  }, [ftConfig]);
  const inValues = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i),
    []
  );

  useEffect(() => {
    if (selectedUnit === "cm") {
      onHeightSelect?.({ height: cmHeight, unit: "cm" });
    } else {
      const totalInches = feet * 12 + inches;
      onHeightSelect?.({
        height: totalInches,
        unit: "ft/in",
      });
    }
  }, [
    cmHeight,
    feet,
    inches,
    selectedUnit,
    onHeightSelect,
  ]);

  const handleUnitToggle = useCallback(
    (unit: "cm" | "ft/in") => {
      if (unit === selectedUnit) return;

      if (unit === "cm") {
        const totalInches = feet * 12 + inches;
        setCmHeight(Math.round(totalInches * 2.54));
      } else {
        const totalInches = Math.round(cmHeight / 2.54);
        setFeet(Math.floor(totalInches / 12));
        setInches(totalInches % 12);
      }
      setSelectedUnit(unit);
      setPickerKey((prevKey) => prevKey + 1); // Force remount for clean state
    },
    [selectedUnit, cmHeight, feet, inches]
  );

  const renderCmPicker = () => (
    <View style={styles.pickerContainer}>
      <WheelPicker
        key={`cm-${pickerKey}`}
        data={cmHeights}
        onSelect={setCmHeight}
        initialValue={cmHeight}
        label="cm"
        isDark={isDark}
      />
    </View>
  );

  const renderFtInPicker = () => (
    <View style={styles.pickerContainer}>
      <WheelPicker
        key={`ft-${pickerKey}`}
        data={ftValues}
        onSelect={setFeet}
        initialValue={feet}
        label="ft"
        isDark={isDark}
      />
      <WheelPicker
        key={`in-${pickerKey}`}
        data={inValues}
        onSelect={setInches}
        initialValue={inches}
        label="in"
        isDark={isDark}
      />
    </View>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: "transparent" }}
    >
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: isDark ? "#A0AEC0" : "#718096" },
            ]}
          >
            A bit more about you
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? "#FFFFFF" : "#2D3748" },
            ]}
          >
            What's your Height
          </Text>
        </View>

        <View
          style={[
            styles.unitToggleContainer,
            {
              backgroundColor: isDark
                ? "#1E293B"
                : "#FFFFFF",
              borderColor: isDark ? "#4A5568" : "#E2E8F0",
            },
          ]}
        >
          <Pressable
            onPress={() => handleUnitToggle("ft/in")}
            style={[
              styles.unitButton,
              selectedUnit === "ft/in" &&
                styles.unitButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.unitButtonText,
                {
                  color:
                    selectedUnit === "ft/in"
                      ? "#FFFFFF"
                      : isDark
                        ? "#A0AEC0"
                        : "#718096",
                },
              ]}
            >
              ft/in
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleUnitToggle("cm")}
            style={[
              styles.unitButton,
              selectedUnit === "cm" &&
                styles.unitButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.unitButtonText,
                {
                  color:
                    selectedUnit === "cm"
                      ? "#FFFFFF"
                      : isDark
                        ? "#A0AEC0"
                        : "#718096",
                },
              ]}
            >
              cm
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.displayContainer,
            {
              backgroundColor: isDark
                ? "#083344"
                : "#E0F7FA",
            },
          ]}
        >
          {selectedUnit === "ft/in"
            ? renderFtInPicker()
            : renderCmPicker()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  unitToggleContainer: {
    flexDirection: "row",
    borderRadius: 25,
    padding: 4,
    marginBottom: 40,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  unitButtonSelected: {
    backgroundColor: "#68D391",
    shadowColor: "#68D391",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  unitButtonText: { fontWeight: "600", fontSize: 16 },
  displayContainer: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    flexShrink: 1,
    justifyContent: "center",
    minHeight:
      PICKER_ITEM_HEIGHT * PICKER_VISIBLE_ITEMS + 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pickerContainer: {
    height: PICKER_ITEM_HEIGHT * PICKER_VISIBLE_ITEMS,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
  pickerColumn: {
    width: PICKER_WIDTH,
    height: "100%",
    position: "relative",
    justifyContent: "center",
  },
  pickerFlatList: {
    width: "100%",
  },
  pickerItemContainer: {
    height: PICKER_ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: 32,
    fontWeight: "600",
  },
  selectionIndicator: {
    position: "absolute",
    top: "50%",
    left: "5%",
    right: "5%",
    height: PICKER_ITEM_HEIGHT,
    marginTop: -PICKER_ITEM_HEIGHT / 2,
    backgroundColor: "rgba(104, 211, 145, 0.25)",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(104, 211, 145, 0.8)",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    pointerEvents: "none",
  },
});
