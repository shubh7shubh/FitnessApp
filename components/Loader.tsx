import React from "react";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/theme";

const Loader = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.light.background,
      }}
    >
      <ActivityIndicator size="large" color={COLORS.light.primary} />
    </View>
  );
};

export default Loader;
