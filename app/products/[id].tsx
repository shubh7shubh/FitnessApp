import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useProductsStore } from "@/modules/products/store/useProductsStore";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isInCart, setIsInCart] = useState(false);

  const product = useProductsStore((state) =>
    state.getProductById(id as string)
  );

  if (!product) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-200">
          Product not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-lg bg-green-500 px-6 py-3"
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    setIsInCart(!isInCart);
    // Add haptic feedback or animation here
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <Stack.Screen
        options={{
          headerTitle: product.name,
          headerBackTitle: "",
          headerTransparent: true,
          headerTintColor: "#fff",
          headerTitleStyle: { color: "transparent" },
        }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero Image Section */}
        <View className="relative">
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width, height: width * 0.8 }}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <View className="absolute inset-0 bg-black/20" />

          {/* Category Badge */}
          <View className="absolute right-4 top-16 rounded-full bg-white/90 px-3 py-2">
            <Text className="text-sm font-bold text-gray-800">
              {product.category}
            </Text>
          </View>

          {/* Product Name and Price */}
          <View className="absolute bottom-6 left-4 right-4">
            <Text className="text-3xl font-extrabold text-white shadow-lg">
              {product.name}
            </Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-green-400 shadow-lg">
                ${product.price}
              </Text>
              <View className="flex-row items-center">
                <Feather name="star" size={18} color="#F59E0B" />
                <Text className="ml-1 text-lg font-semibold text-white">
                  {product.rating}
                </Text>
                <Text className="ml-1 text-base text-gray-300">
                  ({product.reviews} reviews)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="p-6">
          {/* Tagline */}
          <View className="mb-6 rounded-2xl bg-green-50 p-4 dark:bg-green-900/20">
            <Text className="text-center text-lg font-bold italic text-green-800 dark:text-green-300">
              "{product.tagline}"
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="mb-6 flex-row justify-around rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
            <View className="items-center">
              <Feather name="star" size={24} color="#F59E0B" />
              <Text className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {product.rating}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Rating
              </Text>
            </View>
            <View className="items-center">
              <Feather name="users" size={24} color="#8B5CF6" />
              <Text className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {product.reviews}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Reviews
              </Text>
            </View>
            <View className="items-center">
              <Feather name="shield" size={24} color="#10B981" />
              <Text className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                100%
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Quality
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
              Description
            </Text>
            <Text className="text-base leading-7 text-gray-700 dark:text-gray-300">
              {product.description}
            </Text>
          </View>

          {/* Features */}
          <View className="mb-6">
            <Text className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Key Features
            </Text>
            <View className="space-y-3">
              {product.features.map((feature, index) => (
                <View
                  key={index}
                  className="flex-row items-start rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
                >
                  <View className="mr-3 rounded-full bg-green-100 p-2 dark:bg-green-900">
                    <Feather name="check" size={16} color="#10B981" />
                  </View>
                  <Text className="flex-1 text-base text-gray-800 dark:text-gray-200">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trust Indicators */}
          <View className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <View className="flex-row items-center justify-center">
              <Feather name="shield" size={20} color="#3B82F6" />
              <Text className="ml-2 text-center font-semibold text-blue-800 dark:text-blue-300">
                30-day money-back guarantee • Free shipping on orders over $50
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <View className="flex-row space-x-3">
          <Pressable
            onPress={handleAddToCart}
            className={`flex-1 items-center justify-center rounded-2xl border-2 py-4 ${
              isInCart
                ? "border-green-500 bg-green-500"
                : "border-green-500 bg-transparent"
            }`}
          >
            <View className="flex-row items-center">
              <Feather
                name={isInCart ? "check" : "shopping-cart"}
                size={20}
                color={isInCart ? "#fff" : "#10B981"}
              />
              <Text
                className={`ml-2 text-base font-bold ${
                  isInCart ? "text-white" : "text-green-500"
                }`}
              >
                {isInCart ? "Added to Cart" : "Add to Cart"}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => console.log("Buy Now")}
            className="flex-1 items-center justify-center rounded-2xl bg-gray-900 py-4 dark:bg-white"
          >
            <View className="flex-row items-center">
              <Feather
                name="credit-card"
                size={20}
                color={isInCart ? "#000" : "#fff"}
              />
              <Text className="ml-2 text-base font-bold text-white dark:text-gray-900">
                Buy Now
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
