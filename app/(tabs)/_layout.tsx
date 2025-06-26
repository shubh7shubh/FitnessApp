import React, { useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { COLORS } from "@/constants/theme";
import { QuickLogModal } from "@/modules/nutrition";

export default function TabLayout(): React.ReactElement {
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);

  const CustomPlusButton = () => (
    <TouchableOpacity
      onPress={() => setShowQuickLogModal(true)}
      className="items-center justify-center"
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.light.primary,
        shadowColor: COLORS.light.primary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Ionicons name="add" size={28} color="white" />
    </TouchableOpacity>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveTintColor: COLORS.light.primary,
          tabBarInactiveTintColor: COLORS.light.text.secondary,
          tabBarStyle: {
            backgroundColor: "black",
            borderTopWidth: 0,
            position: "absolute",
            elevation: 0,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="diary"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bookmark" size={size} color={color} />
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
          name="notifications"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
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
