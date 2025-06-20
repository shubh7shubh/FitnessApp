import React from "react";
import { View, Text } from "react-native";

export default function CreateScreen(): React.ReactElement {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
      <Text className="text-gray-500 dark:text-gray-400 text-center">
        This screen should not be visible. The create tab should trigger a modal
        instead.
      </Text>
    </View>
  );
}
