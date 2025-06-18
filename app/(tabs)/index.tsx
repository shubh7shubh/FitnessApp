import React, { useState } from "react";
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
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

// Import from our new modular structure
import { HeroSection } from "@/modules/home/components/HeroSection";
import { useTheme } from "@/modules/home/hooks/useTheme";
import { useHomeStore } from "@/modules/home/store/homeStore";
import { Loader } from "@/components/Loader";

export default function Index(): JSX.Element {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { colors } = useTheme();
  const { refreshData, isLoading } = useHomeStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleProfilePress = (): void => {
    router.push("/(tabs)/profile");
  };

  if (isLoading) return <Loader />;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* HEADER */}
      <View
        className="flex-row justify-between items-center px-4 py-3 pt-8"
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
          <Text className="text-sm" style={{ color: colors.text.secondary }}>
            Your fitness journey
          </Text>
        </View>

        {/* Profile Picture */}
        <TouchableOpacity
          onPress={handleProfilePress}
          className="w-10 h-10 rounded-full overflow-hidden"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.primary,
          }}
        >
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-full h-full items-center justify-center"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
          )}
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

        {/* QUICK ACTIONS */}
        <View className="px-4 py-6">
          <Text
            className="text-lg font-semibold mb-4"
            style={{ color: colors.text.primary }}
          >
            Quick Actions
          </Text>

          <View className="flex-row justify-between">
            {[
              { icon: "restaurant", label: "Log Food", color: colors.primary },
              { icon: "fitness", label: "Exercise", color: "#EC4899" },
              { icon: "water", label: "Water", color: "#06B6D4" },
              { icon: "analytics", label: "Progress", color: "#8B5CF6" },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                className="items-center p-4 rounded-2xl flex-1 mx-1"
                style={{ backgroundColor: colors.surface }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: action.color + "20" }}
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

        {/* Add some bottom padding for tab bar */}
        <View className="pb-20" />
      </ScrollView>
    </View>
  );
}
