import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { useProductsStore } from "../store/useProductsStore";
import ProductCard from "./ProductCard";

const ProductsSection = () => {
  const products = useProductsStore((state) => state.products);

  if (!products.length) {
    return (
      <View className="mt-8 flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-2 text-gray-500 dark:text-gray-400">
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-8">
      {/* Header Section */}
      <View className="mb-6 flex-row items-center justify-between px-4">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Exclusive Store
          </Text>
          <Text className="mt-1 text-base text-gray-600 dark:text-gray-400">
            Premium gear & supplements for your fitness journey
          </Text>
        </View>
        <Pressable className="flex-row items-center rounded-full bg-green-100 px-4 py-2 dark:bg-green-900">
          <Text className="mr-2 text-sm font-semibold text-green-700 dark:text-green-300">
            View All
          </Text>
          <Feather name="arrow-right" size={16} color="#059669" />
        </Pressable>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        ItemSeparatorComponent={() => <View className="w-2" />}
      />

      {/* Bottom Info */}
      <View className="mt-4 flex-row items-center justify-center px-4">
        <Feather name="shield" size={16} color="#10B981" />
        <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          All products come with our satisfaction guarantee
        </Text>
      </View>
    </View>
  );
};

export default ProductsSection;
