import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface QuickLogModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const MODAL_HEIGHT = 380;

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();
  const translateY = React.useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: MODAL_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderGrant: () => {
      translateY.setOffset((translateY as any)._value);
      translateY.setValue(0);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
        const newOpacity = Math.max(0, 1 - gestureState.dy / 200);
        opacity.setValue(newOpacity);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      translateY.flattenOffset();

      if (gestureState.dy > 100 || gestureState.vy > 0.8) {
        onClose();
      } else {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  const handleLogFood = () => {
    onClose();
    router.push("/nutrition/search" as any);
  };

  const modalOptions = [
    {
      id: "food",
      title: "Log Food",
      subtitle: "Track meals",
      icon: "restaurant-outline" as const,
      color: "#4ADE80",
      bgColor: "rgba(74, 222, 128, 0.15)",
      onPress: handleLogFood,
    },
    {
      id: "exercise",
      title: "Log Exercise",
      subtitle: "Track workouts",
      icon: "fitness-outline" as const,
      color: "#3B82F6",
      bgColor: "rgba(59, 130, 246, 0.15)",
      onPress: () => {
        onClose();
        // TODO: Navigate to exercise logging
      },
    },
    {
      id: "water",
      title: "Log Water",
      subtitle: "Track hydration",
      icon: "water-outline" as const,
      color: "#06B6D4",
      bgColor: "rgba(6, 182, 212, 0.15)",
      onPress: () => {
        onClose();
        // TODO: Navigate to water logging
      },
    },
    {
      id: "weight",
      title: "Log Weight",
      subtitle: "Track progress",
      icon: "scale-outline" as const,
      color: "#EC4899",
      bgColor: "rgba(236, 72, 153, 0.15)",
      onPress: () => {
        onClose();
        // TODO: Navigate to weight logging
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        className="flex-1 bg-black/40 justify-end"
        style={{ opacity }}
      >
        {/* Backdrop */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <Animated.View
          style={{
            transform: [{ translateY }],
          }}
          className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
          {...panResponder.panHandlers}
        >
          {/* Handle Bar */}
          <View className="items-center pt-4 pb-3">
            <View className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </View>

          {/* Header */}
          <View className="px-6 pb-6">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Quick Log
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mt-1 text-base">
              What would you like to track today?
            </Text>
          </View>

          {/* Options Grid - 2x2 */}
          <View className="px-6 pb-8">
            <View className="flex-row">
              {/* First Row */}
              <View className="flex-1 flex-row gap-4">
                {modalOptions.slice(0, 2).map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={option.onPress}
                    className="flex-1 aspect-square items-center justify-center rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 active:scale-95"
                    style={{
                      backgroundColor: option.bgColor,
                    }}
                  >
                    <View className="items-center">
                      <View className="w-16 h-16 rounded-3xl items-center justify-center mb-3 bg-white/30 dark:bg-black/20">
                        <Ionicons
                          name={option.icon}
                          size={32}
                          color={option.color}
                        />
                      </View>

                      <Text className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-1">
                        {option.title}
                      </Text>

                      <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        {option.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Second Row */}
            <View className="flex-row mt-4">
              <View className="flex-1 flex-row gap-4">
                {modalOptions.slice(2, 4).map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={option.onPress}
                    className="flex-1 aspect-square items-center justify-center rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 active:scale-95"
                    style={{
                      backgroundColor: option.bgColor,
                    }}
                  >
                    <View className="items-center">
                      <View className="w-16 h-16 rounded-3xl items-center justify-center mb-3 bg-white/30 dark:bg-black/20">
                        <Ionicons
                          name={option.icon}
                          size={32}
                          color={option.color}
                        />
                      </View>

                      <Text className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-1">
                        {option.title}
                      </Text>

                      <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        {option.subtitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
