import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  useColorScheme,
  StatusBar,
  Animated,
  Dimensions,
  FlatList,
} from "react-native";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  format,
  addDays,
  isToday,
  startOfToday,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import { Feather } from "@expo/vector-icons";

import { useAppStore } from "@/stores/appStore";
import { COLORS } from "@/constants/theme";
import { CaloriesTab, MacrosTab, NutrientsTab } from "@/modules/nutrition";

const HEADER_HEIGHT = 72;
const TABS_HEIGHT = 50;
const DATE_NAVIGATOR_HEIGHT = 70;

type TabType = "calories" | "nutrients" | "macros";

// This is the content for a single day's page in the swiper
const NutritionPage = React.memo(
  ({
    dateString,
    colorScheme,
    activeTab,
  }: {
    dateString: string;
    colorScheme: "light" | "dark";
    activeTab: TabType;
  }) => {
    const colors = COLORS[colorScheme];

    const renderTabContent = useCallback(() => {
      switch (activeTab) {
        case "calories":
          return <CaloriesTab dateString={dateString} />;
        case "macros":
          return <MacrosTab dateString={dateString} />;
        case "nutrients":
          return <NutrientsTab dateString={dateString} />;
        default:
          return <CaloriesTab dateString={dateString} />;
      }
    }, [activeTab, dateString]);

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: 16,
          paddingHorizontal: 16,
        }}
      >
        {renderTabContent()}
      </View>
    );
  }
);

NutritionPage.displayName = "NutritionPage";

// The main nutrition screen
export default function NutritionScreen() {
  const params = useLocalSearchParams();
  const dateParam = (params?.date as string) || undefined;
  const parsedParamDate = useMemo(() => {
    if (!dateParam) return null;
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(dateParam);
    if (!valid) return null;
    const [y, m, d] = dateParam.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }, [dateParam]);

  const [currentDate, setCurrentDate] = useState(parsedParamDate || new Date());
  const [activeTab, setActiveTab] = useState<TabType>("calories");
  const flatListRef = useRef<FlatList<Date>>(null);
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const router = useRouter();
  const { currentUser } = useAppStore();

  // Animated values for smooth transitions
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const tabsTranslateY = useRef(new Animated.Value(0)).current;
  const dateNavigatorTranslateY = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const tabContentOpacity = useRef(new Animated.Value(1)).current;

  // Tab configuration
  const tabs = [
    { id: "calories" as TabType, label: "CALORIES" },
    { id: "nutrients" as TabType, label: "NUTRIENTS" },
    { id: "macros" as TabType, label: "MACROS" },
  ];

  // Get screen width for indicator animation
  const { width: screenWidth } = Dimensions.get("window");
  const tabWidth = screenWidth / tabs.length;

  // Build full date range from user join date to today (ascending)
  const { dates, initialScrollIndex } = useMemo(() => {
    const today = startOfToday();
    const joinDateRaw: Date = currentUser?.createdAt
      ? new Date(currentUser.createdAt)
      : today;
    const joinDate = startOfDay(joinDateRaw);
    const totalDays = Math.max(
      1,
      differenceInCalendarDays(today, joinDate) + 1
    );
    const datesList = Array.from({ length: totalDays }, (_, i) =>
      addDays(joinDate, i)
    );
    const target = parsedParamDate ? startOfDay(parsedParamDate) : today;
    const index = Math.min(
      datesList.length - 1,
      Math.max(0, differenceInCalendarDays(target, joinDate))
    );
    return {
      dates: datesList,
      initialScrollIndex: index,
    };
  }, [currentUser?.createdAt, parsedParamDate]);

  // Handle tab change with smooth animation
  const handleTabChange = useCallback(
    (tab: TabType) => {
      if (tab === activeTab) return;

      const tabIndex = tabs.findIndex((t) => t.id === tab);

      // Animate tab indicator
      Animated.spring(tabIndicatorPosition, {
        toValue: tabIndex,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Animate content transition
      Animated.sequence([
        Animated.timing(tabContentOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(tabContentOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setActiveTab(tab);
    },
    [activeTab, tabIndicatorPosition, tabContentOpacity, tabs]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: Date }> }) => {
      if (viewableItems && viewableItems.length > 0) {
        const firstVisible = viewableItems[0].item;
        if (firstVisible) {
          setCurrentDate(new Date(firstVisible));
        }
      }
    }
  ).current;

  // When arrows tapped, scroll FlatList
  const changeDate = useCallback(
    (offset: number) => {
      const currentIndex = dates.findIndex(
        (d) => format(d, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd")
      );
      if (currentIndex === -1) return;
      const newIndex = currentIndex + offset;
      if (newIndex < 0 || newIndex >= dates.length) return;
      const newDate = dates[newIndex];
      setCurrentDate(newDate);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    },
    [dates, currentDate]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    [screenWidth]
  );

  // Initialize tab indicator position
  useEffect(() => {
    const initialTabIndex = tabs.findIndex((t) => t.id === activeTab);
    tabIndicatorPosition.setValue(initialTabIndex);
  }, []);

  // Show authentication check
  if (!currentUser) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{ color: colors.text.primary }}
            className="text-lg font-semibold text-center"
          >
            Please create a profile to view nutrition
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
        translucent={false}
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Animated Header - Nutrition Title and Back Button */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          backgroundColor: colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingTop: 16,
          zIndex: 30,
          transform: [{ translateY: headerTranslateY }],
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: colors.surfaceElevated,
            }}
          >
            <Feather name="arrow-left" size={18} color={colors.text.primary} />
          </Pressable>

          <Text
            style={{ color: colors.text.primary }}
            className="text-lg font-bold"
          >
            Nutrition
          </Text>

          <View className="w-9" />
        </View>
      </Animated.View>

      {/* Animated Tabs */}
      <Animated.View
        style={{
          position: "absolute",
          top: HEADER_HEIGHT,
          left: 0,
          right: 0,
          height: TABS_HEIGHT,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          zIndex: 25,
          transform: [{ translateY: tabsTranslateY }],
        }}
      >
        <View className="flex-row flex-1">
          {tabs.map((tab, index) => (
            <Pressable
              key={tab.id}
              onPress={() => handleTabChange(tab.id)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === tab.id ? "#007AFF" : colors.text.secondary,
                  fontWeight: activeTab === tab.id ? "600" : "normal",
                  fontSize: 14,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Animated Blue Indicator Line */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            height: 2,
            backgroundColor: "#007AFF",
            width: tabWidth,
            transform: [
              {
                translateX: tabIndicatorPosition.interpolate({
                  inputRange: [0, tabs.length - 1],
                  outputRange: [0, (tabs.length - 1) * tabWidth],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
        />
      </Animated.View>

      {/* Animated Date Navigator */}
      <Animated.View
        style={{
          position: "absolute",
          top: HEADER_HEIGHT + TABS_HEIGHT,
          left: 0,
          right: 0,
          height: DATE_NAVIGATOR_HEIGHT,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingVertical: 10,
          paddingHorizontal: 20,
          zIndex: 20,
          transform: [{ translateY: dateNavigatorTranslateY }],
        }}
      >
        <View className="flex-row items-center justify-between flex-1">
          <Pressable
            onPress={() => changeDate(-1)}
            className="w-8 h-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: colors.surfaceElevated,
            }}
          >
            <Feather
              name="chevron-left"
              size={16}
              color={colors.text.primary}
            />
          </Pressable>

          <View className="items-center">
            <Text
              style={{
                color: isToday(currentDate) ? "#007AFF" : colors.text.primary,
                fontWeight: isToday(currentDate) ? "700" : "600",
              }}
              className="text-base"
            >
              {isToday(currentDate) ? "Today" : format(currentDate, "EEEE")}
            </Text>
            <Text
              style={{
                color: isToday(currentDate) ? "#007AFF" : colors.text.secondary,
                opacity: isToday(currentDate) ? 0.8 : 1,
              }}
              className="text-xs mt-0.5"
            >
              {format(currentDate, "MMM d, yyyy")}
            </Text>
          </View>

          <Pressable
            onPress={() => changeDate(1)}
            className="w-8 h-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: colors.surfaceElevated,
            }}
          >
            <Feather
              name="chevron-right"
              size={16}
              color={colors.text.primary}
            />
          </Pressable>
        </View>
      </Animated.View>

      {/* Content Area with Horizontal FlatList pager */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          opacity: tabContentOpacity,
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        <View
          style={{
            height: HEADER_HEIGHT + TABS_HEIGHT + DATE_NAVIGATOR_HEIGHT,
          }}
        />
        <FlatList
          ref={flatListRef}
          data={dates}
          keyExtractor={(item) => format(item, "yyyy-MM-dd")}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={{
                width: screenWidth,
                flex: 1,
                backgroundColor: colors.background,
              }}
            >
              <NutritionPage
                dateString={format(item, "yyyy-MM-dd")}
                colorScheme={colorScheme}
                activeTab={activeTab}
              />
            </View>
          )}
          initialScrollIndex={initialScrollIndex}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 51 }}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={3}
          removeClippedSubviews={false}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index, animated: false });
            }, 100);
          }}
        />
      </Animated.View>
    </SafeAreaView>
  );
}
