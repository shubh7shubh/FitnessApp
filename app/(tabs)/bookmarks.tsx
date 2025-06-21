import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Pressable,
  useColorScheme,
  StatusBar,
} from "react-native";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Stack, useRouter } from "expo-router";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import {
  format,
  addDays,
  subDays,
  isToday,
} from "date-fns";
import { Feather } from "@expo/vector-icons";

import CalorieSummary from "@/modules/diary/components/CalorieSummary";
import MealSection from "@/modules/diary/components/MealSection";
import { useDiaryStore } from "@/modules/diary/store/useDiaryStore";
import { COLORS } from "@/constants/theme";

// This is the content for a single day's page in the swiper
const DiaryPage = React.memo(
  ({
    dateString,
    colorScheme,
    router,
    currentDate,
    changeDate,
  }: {
    dateString: string;
    colorScheme: "light" | "dark";
    router: any;
    currentDate: Date;
    changeDate: (offset: number) => void;
  }) => {
    const diary = useDiaryStore((state) =>
      state.getDiaryForDate(dateString)
    );
    const colors = COLORS[colorScheme];

    // Combine meals for the list
    const sections = [...diary.meals];

    return (
      <FlatList
        data={sections}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={() => (
          <View>
            {/* Diary Header - Scrollable */}
            <View
              style={{
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 16,
                marginBottom: 8,
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
                  <Feather
                    name="arrow-left"
                    size={18}
                    color={colors.text.primary}
                  />
                </Pressable>

                <Text
                  style={{ color: colors.text.primary }}
                  className="text-lg font-bold"
                >
                  Diary
                </Text>

                <View className="w-9" />
              </View>
            </View>

            {/* Date Navigator */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                paddingVertical: 12,
                paddingHorizontal: 20,
                marginBottom: 8,
              }}
              className="shadow-sm"
            >
              <View className="flex-row items-center justify-between">
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
                    style={{ color: colors.text.primary }}
                    className="text-base font-semibold"
                  >
                    {isToday(currentDate)
                      ? "Today"
                      : format(currentDate, "EEEE")}
                  </Text>
                  <Text
                    style={{ color: colors.text.secondary }}
                    className="text-xs mt-1"
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
            </View>

            {/* Calories Summary */}
            <CalorieSummary dateString={dateString} />
          </View>
        )}
        ListFooterComponent={() => (
          <View style={{ height: 20 }} />
        )}
        renderItem={({ item }) => (
          <MealSection
            meal={item}
            dateString={dateString}
          />
        )}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    );
  }
);

DiaryPage.displayName = "DiaryPage";

// The main screen component for the "Diary" tab
export default function DiaryTab() {
  const [currentDate, setCurrentDate] = useState(
    new Date()
  );
  const pagerRef = useRef<PagerView>(null);
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const router = useRouter();

  // Optimize: Create only 21 pages (10 days before, today, 10 days after)
  const { dates, initialPage } = useMemo(() => {
    const datesList = Array.from({ length: 21 }).map(
      (_, i) => addDays(new Date(), i - 10)
    );
    return {
      dates: datesList,
      initialPage: 10, // Index of today's date
    };
  }, []);

  // When the user swipes, this updates our state
  const onPageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const newDate = dates[e.nativeEvent.position];
      if (newDate) {
        setCurrentDate(newDate);
      }
    },
    [dates]
  );

  // When the user taps the arrows, this updates the state and moves the pager
  const changeDate = useCallback(
    (offset: number) => {
      if (!pagerRef.current) return;

      const currentIndex = dates.findIndex(
        (d) =>
          format(d, "yyyy-MM-dd") ===
          format(currentDate, "yyyy-MM-dd")
      );

      if (currentIndex === -1) return;

      const newIndex = currentIndex + offset;

      // Check bounds
      if (newIndex < 0 || newIndex >= dates.length) return;

      const newDate = dates[newIndex];
      setCurrentDate(newDate);
      pagerRef.current.setPage(newIndex);
    },
    [dates, currentDate]
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle={
          colorScheme === "dark"
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={colors.background}
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor:
            colorScheme === "dark" ? "#0F0F0F" : "#F8FAFC",
        }}
      >
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={initialPage}
          onPageSelected={onPageSelected}
          overdrag={true}
          scrollEnabled={true}
        >
          {dates.map((date, index) => (
            <View
              key={format(date, "yyyy-MM-dd")}
              style={{ flex: 1 }}
            >
              <DiaryPage
                dateString={format(date, "yyyy-MM-dd")}
                colorScheme={colorScheme}
                router={router}
                currentDate={currentDate}
                changeDate={changeDate}
              />
            </View>
          ))}
        </PagerView>
      </View>
    </SafeAreaView>
  );
}
