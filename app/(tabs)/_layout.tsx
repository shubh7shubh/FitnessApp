import React, { useState } from "react";
import { Tabs } from "expo-router";
import {
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { COLORS } from "@/constants/theme";
import { QuickLogModal } from "@/modules/nutrition";

export default function TabLayout(): React.ReactElement {
  const [showQuickLogModal, setShowQuickLogModal] =
    useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const CustomPlusButton = () => (
    <View className="items-center justify-center -mt-3 px-1">
      <TouchableOpacity
        onPress={() => setShowQuickLogModal(true)}
        style={{
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        className="w-14 h-14 rounded-full items-center justify-center"
        activeOpacity={0.9}
      >
        <MaterialCommunityIcons
          name="plus"
          size={28}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );

  // Enhanced tab icon component with smooth animations
  const TabIcon = ({
    name,
    focused,
    color,
    size,
    IconComponent = MaterialCommunityIcons,
  }: {
    name: any;
    focused: boolean;
    color: string;
    size: number;
    IconComponent?: any;
  }) => (
    <View className="items-center justify-center py-2 px-3 min-w-12">
      <View
        style={{
          backgroundColor: focused
            ? `${colors.primary}${colorScheme === "dark" ? "18" : "10"}`
            : "transparent",
        }}
        className="w-11 h-9 rounded-2xl items-center justify-center"
      >
        <IconComponent
          name={name}
          size={24}
          color={focused ? colors.primary : color}
          style={{
            opacity: focused ? 1 : 0.7,
          }}
        />
      </View>
    </View>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor:
            colorScheme === "dark"
              ? colors.text.secondary
              : `${colors.text.secondary}CC`,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            position: "absolute",
            elevation: 0,
            shadowColor:
              colorScheme === "dark"
                ? "#000"
                : colors.text.primary,
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity:
              colorScheme === "dark" ? 0.2 : 0.06,
            shadowRadius: 8,
            height: 72,
            paddingBottom: 8,
            paddingTop: 8,
            paddingHorizontal: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name={
                  focused
                    ? "view-dashboard"
                    : "view-dashboard-outline"
                }
                focused={focused}
                color={color}
                size={size}
                IconComponent={MaterialCommunityIcons}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="diary"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name={
                  focused ? "notebook" : "notebook-outline"
                }
                focused={focused}
                color={color}
                size={size}
                IconComponent={MaterialCommunityIcons}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            tabBarButton: () => <CustomPlusButton />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            headerShown: true,
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name={
                  focused
                    ? "chart-line"
                    : "chart-line-variant"
                }
                focused={focused}
                color={color}
                size={size}
                IconComponent={MaterialCommunityIcons}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name={
                  focused
                    ? "account-circle"
                    : "account-circle-outline"
                }
                focused={focused}
                color={color}
                size={size}
                IconComponent={MaterialCommunityIcons}
              />
            ),
          }}
        />
      </Tabs>

      {/* Quick Log Modal */}
      <QuickLogModal
        visible={showQuickLogModal}
        onClose={() => setShowQuickLogModal(false)}
      />
    </>
  );
}
