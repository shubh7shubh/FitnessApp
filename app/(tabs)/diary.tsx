import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Pressable,
  useColorScheme,
  StatusBar,
  Dimensions,
} from "react-native";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  format,
  addDays,
  isToday,
  startOfToday,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CalorieSummary from "@/modules/diary/components/CalorieSummary";
import { DiaryList } from "@/modules/diary/components/DiaryList";
import CalendarModal from "@/modules/diary/components/CalendarModal";
import { useAppStore } from "@/stores/appStore";
import { useTheme } from "@/modules/home/hooks/useTheme";

// Optimized constants for better spacing
const HEADER_HEIGHT = 58;
const DATE_NAVIGATOR_HEIGHT = 56;
const CALORIE_SUMMARY_HEIGHT = 80;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// This is the content for a single day's page in the swiper
const DiaryPage = React.memo(
  ({
    dateString,
    date,
    router,
    changeDate,
    colors,
    isDark,
    onOpenCalendar,
  }: {
    dateString: string;
    date: Date;
    router: any;
    changeDate: (offset: number) => void;
    colors: any;
    isDark: boolean;
    onOpenCalendar: (date: Date) => void;
  }) => {
    // Create the data structure for FlatList with sticky headers
    const listData = [
      { type: "dateNavigator", key: "dateNavigator" },
      { type: "calorieSummary", key: "calorieSummary" },
      { type: "diaryContent", key: "diaryContent" },
    ];

    const renderItem = ({ item }: { item: any }) => {
      switch (item.type) {
        case "dateNavigator":
          return (
            <View
              style={{
                height: DATE_NAVIGATOR_HEIGHT,
                backgroundColor: isDark ? "#1f1f1f" : "#f8f9fa",
                borderBottomWidth: isDark ? 0 : 1,
                borderBottomColor: isDark
                  ? "transparent"
                  : colors.border + "15",
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
            >
              <View className="flex-row items-center justify-between flex-1">
                <Pressable
                  onPress={() => changeDate(-1)}
                  className="w-10 h-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
                    shadowColor: isDark ? "#000" : "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Feather
                    name="chevron-left"
                    size={18}
                    color={colors.text.primary}
                  />
                </Pressable>

                <Pressable
                  onPress={() => onOpenCalendar(date)}
                  className="items-center flex-1 mx-4"
                  android_ripple={{
                    color: isDark ? "#ffffff20" : "#00000010",
                    borderless: false,
                  }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                  }}
                >
                  <Text
                    style={{
                      color: isToday(date) ? "#059669" : colors.text.primary,
                      fontWeight: "700",
                    }}
                    className="text-lg"
                  >
                    {isToday(date) ? "Today" : format(date, "EEEE")}
                  </Text>
                  <Text
                    style={{
                      color: isToday(date)
                        ? "#059669" + "CC"
                        : colors.text.secondary,
                    }}
                    className="text-sm mt-0.5 font-medium"
                  >
                    {format(date, "MMM d, yyyy")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => changeDate(1)}
                  className="w-10 h-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
                    shadowColor: isDark ? "#000" : "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={colors.text.primary}
                  />
                </Pressable>
              </View>
            </View>
          );

        case "calorieSummary":
          return (
            <View
              style={{
                minHeight: CALORIE_SUMMARY_HEIGHT,
                backgroundColor: colors.background,
                shadowColor: isDark ? "#000" : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.1 : 0.03,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="px-5 pt-2 pb-3">
                <CalorieSummary dateString={dateString} />
              </View>
            </View>
          );

        case "diaryContent":
          return (
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 8,
                minHeight: 500,
              }}
            >
              <DiaryList dateString={dateString} />
            </View>
          );

        default:
          return null;
      }
    };

    return (
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
        bounces={true}
        // Make both date navigator and calorie summary sticky
        stickyHeaderIndices={[0, 1]}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={21}
        initialNumToRender={3}
      />
    );
  }
);

DiaryPage.displayName = "DiaryPage";

// The main screen component for the "Diary" tab
export default function DiaryTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const flatListRef = useRef<FlatList<Date>>(null);
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { currentUser } = useAppStore();
  const insets = useSafeAreaInsets();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Define header background color
  const headerBgColor = isDark ? "#1a1a1a" : "#ffffff";

  // Set status bar style when this screen is focused
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");

      return () => {
        StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
      };
    }, [isDark])
  );

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
    return {
      dates: datesList,
      initialScrollIndex: datesList.length - 1, // position at today
    };
  }, [currentUser?.createdAt]);

  // When the user taps the arrows, this updates the state and moves the pager
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

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  // Show authentication check
  if (!currentUser) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: headerBgColor,
        }}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={headerBgColor}
          translucent={false}
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
            Please create a profile to view your diary
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: headerBgColor,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={headerBgColor}
        translucent={false}
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Fixed Header with proper safe area */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: headerBgColor,
        }}
      >
        <View
          style={{
            height: HEADER_HEIGHT,
            backgroundColor: headerBgColor,
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 12,
            shadowColor: isDark ? "#000" : "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: isDark ? 0.25 : 0.06,
            shadowRadius: 8,
            elevation: 4,
            borderBottomWidth: isDark ? 0 : 1,
            borderBottomColor: isDark ? "transparent" : colors.border + "20",
          }}
        >
          <View className="flex-row items-center justify-between h-full">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark ? "#2a2a2a" : colors.surface,
              }}
            >
              <Feather
                name="arrow-left"
                size={18}
                color={colors.text.primary}
              />
            </Pressable>

            <View className="items-center flex-1">
              <Text
                style={{ color: colors.text.primary }}
                className="text-xl font-bold"
              >
                My Diary
              </Text>
            </View>

            {/* Removed overflow menu button */}
          </View>
        </View>
      </View>

      {/* Horizontal, paginated FlatList as virtualized pager */}
      <FlatList
        ref={flatListRef}
        data={dates}
        keyExtractor={(item) => format(item, "yyyy-MM-dd")}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: colors.background }}
        renderItem={({ item }) => (
          <View
            style={{ width: SCREEN_WIDTH, backgroundColor: colors.background }}
          >
            <DiaryPage
              dateString={format(item, "yyyy-MM-dd")}
              date={item}
              router={router}
              changeDate={changeDate}
              colors={colors}
              isDark={isDark}
              onOpenCalendar={(d: Date) => {
                setCalendarMonth(d);
                setCalendarVisible(true);
              }}
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

      <CalendarModal
        visible={calendarVisible}
        monthDate={calendarMonth}
        selectedDate={currentDate}
        onClose={() => setCalendarVisible(false)}
        onSelectDate={(d) => {
          const index = dates.findIndex(
            (x) => format(x, "yyyy-MM-dd") === format(d, "yyyy-MM-dd")
          );
          if (index >= 0) {
            setCurrentDate(d);
            flatListRef.current?.scrollToIndex({ index, animated: true });
          }
        }}
      />
    </View>
  );
}
