import React, { useMemo, useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
} from "react-native";
import {
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  differenceInMonths,
} from "date-fns";
import { useTheme } from "@/modules/home/hooks/useTheme";
import { database } from "@/db";
import { Q } from "@nozbe/watermelondb";
import { DiaryEntry } from "@/db/models/DiaryEntry";
import { useAppStore } from "@/stores/appStore";
import { Feather } from "@expo/vector-icons";

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  monthDate: Date; // any date within the month currently viewed
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  monthDate,
  selectedDate,
  onSelectDate,
}) => {
  const { colors, isDark } = useTheme();
  const { currentUser } = useAppStore();

  const [monthTotals, setMonthTotals] = useState<Record<string, number>>({});
  const modalWidth = Dimensions.get("window").width * 0.92;

  // Build month pages from user's join month to current month
  const today = useMemo(() => new Date(), []);
  const joinMonth = useMemo(
    () =>
      startOfMonth(
        currentUser?.createdAt ? new Date(currentUser.createdAt) : today
      ),
    [currentUser?.createdAt, today]
  );
  const endMonth = useMemo(() => startOfMonth(today), [today]);
  const months = useMemo(() => {
    const diff = differenceInMonths(endMonth, joinMonth);
    return Array.from({ length: diff + 1 }, (_, i) => addMonths(joinMonth, i));
  }, [joinMonth, endMonth]);
  const initialMonthIndex = useMemo(() => {
    const base = monthDate || selectedDate || today;
    const idx = differenceInMonths(startOfMonth(base), joinMonth);
    return Math.max(0, Math.min(months.length - 1, idx));
  }, [months.length, joinMonth, monthDate, selectedDate, today]);
  const [visibleIndex, setVisibleIndex] = useState<number>(initialMonthIndex);

  React.useEffect(() => {
    const loadMonthTotals = async () => {
      if (!currentUser) return;
      const monthStart = startOfMonth(months[visibleIndex] || today);
      const monthEnd = endOfMonth(months[visibleIndex] || today);
      const entries = await database.collections
        .get<DiaryEntry>("diary_entries")
        .query(
          Q.where("user_id", currentUser.id),
          Q.where("date", Q.gte(format(monthStart, "yyyy-MM-dd"))),
          Q.where("date", Q.lte(format(monthEnd, "yyyy-MM-dd")))
        )
        .fetch();

      const totals: Record<string, number> = {};
      for (const e of entries) {
        totals[e.date] = (totals[e.date] || 0) + (e.calories || 0);
      }
      setMonthTotals(totals);
    };
    loadMonthTotals();
  }, [visibleIndex, months, currentUser, today]);

  const buildDays = (m: Date) => {
    const start = startOfWeek(startOfMonth(m), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(m), { weekStartsOn: 0 });
    const days: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) {
      days.push(d);
    }
    return days;
  };

  const renderDay = ({ item }: { item: Date }) => {
    const inMonth = isSameMonth(item, monthDate);
    const selected = isSameDay(item, selectedDate);
    const key = format(item, "yyyy-MM-dd");
    const calories = monthTotals[key] || 0;

    return (
      <Pressable
        onPress={() => {
          if (inMonth) onSelectDate(item);
          onClose();
        }}
        style={{
          width: "14.28%",
          paddingVertical: 8,
          alignItems: "center",
          justifyContent: "center",
          opacity: inMonth ? 1 : 0.35,
        }}
      >
        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 10,
            backgroundColor: selected
              ? isDark
                ? "#064e3b"
                : "#d1fae5"
              : "transparent",
          }}
        >
          <Text style={{ color: colors.text.primary, textAlign: "center" }}>
            {format(item, "d")}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 10,
              textAlign: "center",
            }}
          >
            {calories > 0 ? Math.round(calories) : "-"}
          </Text>
        </View>
      </Pressable>
    );
  };

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  const monthViewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 51,
  }).current;
  const onMonthsViewable = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index?: number }> }) => {
      if (viewableItems && viewableItems.length > 0) {
        const idx = viewableItems[0].index ?? 0;
        setVisibleIndex(idx);
      }
    }
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "92%",
            borderRadius: 16,
            backgroundColor: colors.surface,
          }}
        >
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={() => setVisibleIndex((i) => Math.max(0, i - 1))}
              style={{ padding: 6 }}
            >
              <Feather
                name="chevron-left"
                size={18}
                color={colors.text.primary}
              />
            </Pressable>
            <Text
              style={{
                color: colors.text.primary,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              {format(months[visibleIndex] || today, "MMMM yyyy")}
            </Text>
            <Pressable
              onPress={() =>
                setVisibleIndex((i) => Math.min(months.length - 1, i + 1))
              }
              style={{ padding: 6 }}
            >
              <Feather
                name="chevron-right"
                size={18}
                color={colors.text.primary}
              />
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 8, paddingTop: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              {daysOfWeek.map((d, i) => (
                <Text
                  key={`${d}-${i}`}
                  style={{
                    width: "14.28%",
                    textAlign: "center",
                    color: colors.text.secondary,
                    fontWeight: "600",
                  }}
                >
                  {d}
                </Text>
              ))}
            </View>
            <FlatList
              data={months}
              keyExtractor={(m) => format(m, "yyyy-MM")}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={initialMonthIndex}
              getItemLayout={(_, index) => ({
                length: modalWidth,
                offset: modalWidth * index,
                index,
              })}
              onViewableItemsChanged={onMonthsViewable}
              viewabilityConfig={monthViewabilityConfig}
              renderItem={({ item }) => (
                <View style={{ width: modalWidth }}>
                  <FlatList
                    data={buildDays(item)}
                    renderItem={renderDay}
                    keyExtractor={(d) => format(d, "yyyy-MM-dd")}
                    numColumns={7}
                    scrollEnabled={false}
                  />
                </View>
              )}
            />
          </View>
          <Pressable
            onPress={onClose}
            android_ripple={{ color: isDark ? "#ffffff20" : "#00000010" }}
            style={{
              padding: 14,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text.secondary, fontWeight: "700" }}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default CalendarModal;
