import React, { useState, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { format } from "date-fns/format";
import { Q } from "@nozbe/watermelondb";
import { database } from "@/db/index";
import { DiaryEntry } from "@/db/models/DiaryEntry";

// Import from our new modular structure
import { HeroSection } from "@/modules/home/components/HeroSection";
import { PlansBanner } from "@/modules/home/components/PlansBanner";
import { useTheme } from "@/modules/home/hooks/useTheme";
import { useHomeStore } from "@/modules/home/store/homeStore";
import Loader from "@/components/Loader";
import { QuickLogModal } from "@/modules/nutrition";
import { useAppStore } from "@/stores/appStore";

// --- 1. ADD THESE IMPORTS ---
import { useProductsStore } from "@/modules/products/store/useProductsStore";
import ProductsSection from "@/modules/products/components/ProductsSection";

export default function Index(): JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const { refreshData, isLoading } = useHomeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickLogModal, setShowQuickLogModal] =
    useState(false);
  const { currentUser } = useAppStore();
  const { todayStats, updateTodayStats } = useHomeStore();

  // --- 2. ADD THIS LOGIC TO FETCH PRODUCT DATA ---
  const { fetchProducts } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const todayString = format(new Date(), "yyyy-MM-dd");

    // 1. Create the observable query for today's diary entries
    const entriesObservable = database.collections
      .get<DiaryEntry>("diary_entries")
      .query(
        Q.where("date", todayString),
        Q.where("user_id", currentUser.id)
      )
      .observe();

    // 2. Subscribe to it. This code runs whenever today's diary changes.
    const subscription = entriesObservable.subscribe(
      (entries) => {
        console.log(
          `[Home Screen Bridge] Detected ${entries.length} entries for today.`
        );

        // 3. Call the Zustand action to update the hero section stats
        updateTodayStats(entries, currentUser);
      }
    );

    // 4. Cleanup function to prevent memory leaks
    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, updateTodayStats]);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleProfilePress = (): void => {
    router.push("/(tabs)/profile");
  };

  const quickActions = [
    {
      icon: "restaurant",
      label: "Log Food",
      color: colors.primary,
      onPress: () => router.push("/nutrition/search"),
    },
    {
      icon: "fitness",
      label: "Exercise",
      color: "#EC4899",
      onPress: () => setShowQuickLogModal(true),
    },
    {
      icon: "water",
      label: "Water",
      color: "#06B6D4",
      onPress: () => setShowQuickLogModal(true),
    },
    {
      icon: "analytics",
      label: "Progress",
      color: "#8B5CF6",
      onPress: () => setShowQuickLogModal(true),
    },
  ];

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* HEADER */}
      <View
        className="flex-row justify-between items-center px-6 py-4 pt-3"
        style={{
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View>
          <Text
            className="text-2xl font-jetbrains-mono font-bold"
            style={{ color: colors.primary }}
          >
            FitNext
          </Text>
          <Text
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            Your fitness journey
          </Text>
        </View>

        {/* Profile Picture */}
        <TouchableOpacity
          onPress={handleProfilePress}
          className="w-12 h-12 rounded-full overflow-hidden"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.primary,
          }}
        >
          <View
            className="w-full h-full items-center justify-center"
            style={{
              backgroundColor: colors.primary + "20",
            }}
          >
            <Text style={{ color: colors.primary }}>
              {currentUser?.name?.charAt(0) || "U"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* HERO SECTION */}
        <HeroSection />

        {/* PLANS BANNER */}
        <PlansBanner />

        {/* QUICK ACTIONS */}
        <View className="px-4 py-2">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.text.primary }}
          >
            Quick Actions
          </Text>

          <View className="flex-row justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                className="items-center p-4 rounded-2xl flex-1 mx-1"
                style={{ backgroundColor: colors.surface }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{
                    backgroundColor: action.color + "20",
                  }}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text
                  className="text-sm font-medium text-center"
                  style={{ color: colors.text.primary }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- 3. ADD THE PRODUCTS SECTION HERE --- */}
        <ProductsSection />

        {/* Add some bottom padding for tab bar */}
        <View className="pb-20" />
      </ScrollView>

      {/* Quick Log Modal */}
      <QuickLogModal
        visible={showQuickLogModal}
        onClose={() => setShowQuickLogModal(false)}
      />
    </View>
  );
}
