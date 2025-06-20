import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link
      href={{
        pathname: "/products/[id]",
        params: { id: product.id },
      }}
      asChild
    >
      <Pressable className="mr-4 w-48 rounded-2xl bg-white p-3 shadow-lg dark:bg-gray-800">
        {/* Product Image with Category Badge */}
        <View className="relative overflow-hidden rounded-xl">
          <Image
            source={{ uri: product.imageUrl }}
            className="h-48 w-full"
            resizeMode="cover"
          />
          <View className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1">
            <Text className="text-xs font-medium text-white">
              {product.category}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View className="mt-3">
          <Text
            className="text-lg font-bold text-gray-900 dark:text-white"
            numberOfLines={1}
          >
            {product.name}
          </Text>

          <Text
            className="mt-1 text-sm text-gray-600 dark:text-gray-400"
            numberOfLines={2}
          >
            {product.tagline}
          </Text>

          {/* Rating and Reviews */}
          <View className="mt-2 flex-row items-center">
            <Feather name="star" size={14} color="#F59E0B" />
            <Text className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {product.rating}
            </Text>
            <Text className="ml-1 text-sm text-gray-500 dark:text-gray-400">
              ({product.reviews})
            </Text>
          </View>

          {/* Price */}
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-green-600 dark:text-green-400">
              ${product.price}
            </Text>
            <View className="rounded-full bg-green-100 p-2 dark:bg-green-900">
              <Feather name="shopping-cart" size={16} color="#10B981" />
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

export default ProductCard;
