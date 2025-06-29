// app/(modals)/log-weight.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  isBefore,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Ionicons } from "@expo/vector-icons";

import { useAppStore } from "@/stores/appStore";
import { logOrUpdateWeight } from "@/db/actions/progressActions";
import { COLORS } from "@/constants/theme";

const LogWeightScreen = React.memo(() => {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const [weight, setWeight] = useState(
    currentUser?.currentWeightKg?.toString() || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const handleSaveWeight = async () => {
    if (!currentUser) {
      Alert.alert("Error", "No user is currently logged in.");
      return;
    }
    const weightValue = parseFloat(weight);
    if (!weight || isNaN(weightValue) || weightValue <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid, positive weight.");
      return;
    }

    setIsSubmitting(true);
    try {
      const todayString = format(selectedDate, "yyyy-MM-dd");
      await logOrUpdateWeight(currentUser.id, weightValue, todayString);

      router.back();
    } catch (error) {
      console.error("Failed to log weight:", error);
      Alert.alert("Error", "Could not save your weight. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Memoized callback to prevent re-renders on every keystroke
  const handleWeightChange = useCallback((text: string) => {
    setWeight(text);
  }, []);

  // Calendar helper functions
  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (isAfter(date, today)) {
      Alert.alert("Invalid Date", "You cannot log weight for future dates.");
      return;
    }

    setSelectedDate(date);
    setShowDatePicker(false);
    console.log(`📅 Selected date: ${format(date, "yyyy-MM-dd")}`);
  };

  const handlePreviousMonth = () => {
    setCalendarMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(calendarMonth, 1);
    const today = new Date();

    // Don't allow navigating to future months
    if (
      nextMonth.getFullYear() > today.getFullYear() ||
      (nextMonth.getFullYear() === today.getFullYear() &&
        nextMonth.getMonth() > today.getMonth())
    ) {
      return;
    }

    setCalendarMonth(nextMonth);
  };

  const getCalendarDays = () => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    const startWeek = startOfWeek(start);
    const endWeek = endOfWeek(end);

    return eachDayOfInterval({ start: startWeek, end: endWeek });
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === calendarMonth.getMonth();
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return isAfter(date, today);
  };

  const openDatePicker = () => {
    setCalendarMonth(selectedDate);
    setShowDatePicker(true);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(calendarMonth);
    newDate.setFullYear(year);
    setCalendarMonth(newDate);
    setShowYearPicker(false);
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Show years from 1950 to current year
    for (let year = currentYear; year >= 1950; year--) {
      years.push(year);
    }
    return years;
  };

  const toggleYearPicker = () => {
    setShowYearPicker(!showYearPicker);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Custom Navigation Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-black border-b border-gray-800">
        <Pressable onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <Text className="text-white text-lg font-semibold">Add Weight</Text>

        <Pressable
          onPress={handleSaveWeight}
          disabled={isSubmitting}
          className={`p-2 -mr-2 ${isSubmitting ? "opacity-50" : "opacity-100"}`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <Ionicons name="checkmark" size={24} color="#10B981" />
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-5 py-6">
          {/* Weight Input Section */}
          <View className="bg-gray-900 rounded-2xl p-5 mb-4 flex-row justify-between items-center border border-gray-800">
            <Text className="text-white text-base font-medium">
              Weight (kg)
            </Text>

            <View className="flex-row items-center">
              <TextInput
                style={styles.weightInput}
                placeholder="50"
                placeholderTextColor="#6B7280"
                value={weight}
                onChangeText={handleWeightChange}
                keyboardType="decimal-pad"
                autoFocus={true}
                returnKeyType="done"
                blurOnSubmit={true}
                maxLength={6}
                selectTextOnFocus={true}
                caretHidden={false}
                editable={!isSubmitting}
                allowFontScaling={false}
                textContentType="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
          </View>

          {/* Date Section */}
          <Pressable
            onPress={openDatePicker}
            className="bg-gray-900 rounded-2xl p-5 mb-4 flex-row justify-between items-center border border-gray-800"
          >
            <Text className="text-white text-base font-medium">Date</Text>

            <View className="flex-row items-center">
              <Text className="text-emerald-400 text-base font-semibold mr-2">
                {format(selectedDate, "d MMM yyyy")}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#10B981" />
            </View>
          </Pressable>

          {/* Progress Photo Section */}
          <View className="bg-gray-900 rounded-2xl p-5 mb-6 flex-row justify-between items-center border border-gray-800">
            <Text className="text-white text-base font-medium">
              Progress Photo
            </Text>

            <Pressable
              className="p-2"
              onPress={() => {
                Alert.alert(
                  "Coming Soon",
                  "Photo feature will be available soon!"
                );
              }}
            >
              <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Weight Tips Section */}
          <View className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="bulb-outline"
                size={20}
                color="#10B981"
                className="mr-2"
              />
              <Text className="text-emerald-400 text-sm font-semibold ml-2">
                Pro Tip
              </Text>
            </View>
            <Text className="text-gray-400 text-sm leading-5">
              For best results, weigh yourself at the same time each day,
              preferably in the morning after using the bathroom.
            </Text>
          </View>

          {/* Spacer to push button to bottom */}
          <View className="flex-1" />

          {/* Save Button */}
          <Pressable
            onPress={handleSaveWeight}
            disabled={isSubmitting || !weight}
            className={`bg-emerald-500 rounded-2xl py-4 items-center ${
              isSubmitting || !weight ? "opacity-50" : "opacity-100"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Save Weight
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
        statusBarTranslucent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#111827", // gray-900
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: 500,
              paddingTop: 32, // Add extra padding at top
            }}
          >
            {/* Calendar Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
                paddingHorizontal: 8,
              }}
            >
              <Pressable onPress={handlePreviousMonth} style={{ padding: 8 }}>
                <Ionicons name="chevron-back" size={24} color="white" />
              </Pressable>

              <Pressable onPress={toggleYearPicker} style={{ padding: 8 }}>
                <Text
                  style={{ color: "white", fontSize: 18, fontWeight: "600" }}
                >
                  {format(calendarMonth, "MMMM yyyy")}
                </Text>
              </Pressable>

              <Pressable onPress={handleNextMonth} style={{ padding: 8 }}>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </Pressable>
            </View>

            {/* Year Picker */}
            {showYearPicker ? (
              <View style={{ height: 200, marginBottom: 20 }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingVertical: 20 }}
                >
                  {getAvailableYears().map((year) => {
                    const isSelected = year === calendarMonth.getFullYear();
                    return (
                      <Pressable
                        key={year}
                        onPress={() => handleYearSelect(year)}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 20,
                          marginVertical: 2,
                          borderRadius: 8,
                          backgroundColor: isSelected
                            ? "#10B981"
                            : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected ? "white" : "#D1D5DB",
                            fontSize: 16,
                            fontWeight: isSelected ? "600" : "400",
                            textAlign: "center",
                          }}
                        >
                          {year}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : (
              <>
                {/* Days of Week */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    paddingHorizontal: 4,
                  }}
                >
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <Text
                        key={day}
                        style={{
                          color: "#9CA3AF",
                          fontSize: 12,
                          fontWeight: "500",
                          width: 40,
                          textAlign: "center",
                        }}
                      >
                        {day}
                      </Text>
                    )
                  )}
                </View>

                {/* Calendar Grid */}
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {getCalendarDays().map((date: Date, index: number) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isDisabled = isDateDisabled(date);
                    const isToday = isSameDay(date, new Date());
                    const isCurrentMonth = isDateInCurrentMonth(date);

                    return (
                      <Pressable
                        key={index}
                        onPress={() =>
                          !isDisabled &&
                          isCurrentMonth &&
                          handleDateSelect(date)
                        }
                        style={{
                          width: 40,
                          height: 40,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 8,
                          margin: 4,
                          backgroundColor: isSelected
                            ? "#10B981"
                            : isToday
                              ? "#374151"
                              : "transparent",
                        }}
                        disabled={isDisabled || !isCurrentMonth}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: !isCurrentMonth
                              ? "#4B5563"
                              : isDisabled
                                ? "#6B7280"
                                : isSelected
                                  ? "white"
                                  : isToday
                                    ? "#10B981"
                                    : "white",
                          }}
                        >
                          {date.getDate()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* Calendar Footer */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 24,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: "#374151",
              }}
            >
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  marginRight: 12,
                }}
              >
                <Text
                  style={{ color: "#9CA3AF", fontSize: 16, fontWeight: "600" }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{ color: "#10B981", fontSize: 16, fontWeight: "600" }}
                >
                  Done
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

LogWeightScreen.displayName = "LogWeightScreen";

const styles = StyleSheet.create({
  weightInput: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});

export default LogWeightScreen;
