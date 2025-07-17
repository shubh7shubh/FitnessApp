import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Article } from "../types";

interface FeaturedArticleCardProps {
  article: Article;
  onPress: () => void;
}

export const FeaturedArticleCard = ({
  article,
  onPress,
}: FeaturedArticleCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const isDark = useColorScheme() === "dark";

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Recovery: "#10B981",
      Strength: "#F59E0B",
      Hydration: "#06B6D4",
      Mindset: "#8B5CF6",
      Supplement: "#EF4444",
    };
    return colors[category as keyof typeof colors] || "#10B981";
  };

  if (imageError) {
    // Fallback design when image fails to load
    return (
      <Pressable
        onPress={onPress}
        className={`w-full h-80 rounded-3xl overflow-hidden mb-8 active:opacity-90 ${
          isDark ? "bg-black" : "bg-gray-100"
        }`}
      >
        <View className="flex-1 justify-center items-center p-6">
          {/* Fallback Icon */}
          <View
            className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
              isDark ? "bg-gray-900" : "bg-gray-200"
            }`}
          >
            <Feather
              name="image"
              size={32}
              color={getCategoryColor(article.category)}
            />
          </View>

          {/* Content */}
          <Text
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: getCategoryColor(article.category) }}
          >
            {article.category}
          </Text>
          <Text
            className={`text-2xl font-bold text-center leading-tight mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {article.title}
          </Text>

          {/* Meta info */}
          <View className="flex-row items-center">
            <Feather
              name="book-open"
              size={14}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
            <Text
              className={`text-sm ml-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {article.readTime} min read
            </Text>
            <Text
              className={`text-sm mx-2 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              •
            </Text>
            <Text
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Featured
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="w-full h-80 rounded-3xl overflow-hidden mb-8 active:opacity-90 shadow-lg"
    >
      <ImageBackground
        source={{ uri: article.imageUrl }}
        className="flex-1 justify-end"
        onLoad={handleImageLoad}
        onError={handleImageError}
      >
        {/* Loading Indicator */}
        {imageLoading && (
          <View className="absolute inset-0 items-center justify-center bg-gray-200 dark:bg-black">
            <ActivityIndicator
              size="large"
              color={getCategoryColor(article.category)}
            />
            <Text
              className={`mt-2 text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Loading image...
            </Text>
          </View>
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={[
            "transparent",
            "rgba(0,0,0,0.3)",
            "rgba(0,0,0,0.8)",
            "rgba(0,0,0,0.95)",
          ]}
          locations={[0, 0.4, 0.8, 1]}
          className="absolute inset-0"
        />

        {/* Featured Badge */}
        <View className="absolute top-6 right-6">
          <View className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold uppercase tracking-wider">
              Featured
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-6 pb-8">
          {/* Category Badge */}
          <View className="flex-row items-center mb-3">
            <View
              className="px-3 py-1 rounded-full mr-3"
              style={{
                backgroundColor: getCategoryColor(article.category) + "20",
              }}
            >
              <Text
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: getCategoryColor(article.category) }}
              >
                {article.category}
              </Text>
            </View>
            <View className="w-2 h-2 rounded-full bg-white/60" />
            <Text className="text-white/80 text-xs ml-2 uppercase tracking-wide">
              Editor's Pick
            </Text>
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-white leading-tight mb-4">
            {article.title}
          </Text>

          {/* Headline/Summary */}
          {article.headline && (
            <Text
              className="text-white/90 text-base leading-relaxed mb-4"
              numberOfLines={2}
            >
              {article.headline}
            </Text>
          )}

          {/* Meta Info */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Feather name="book-open" size={16} color="white" />
              <Text className="text-white text-sm ml-2 font-medium">
                {article.readTime} min read
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text className="text-white/80 text-sm mr-2">
                By {article.author}
              </Text>
              <Feather name="arrow-right" size={16} color="white" />
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};
