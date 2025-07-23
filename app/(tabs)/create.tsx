import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";

import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/stores/appStore";
import * as ImagePicker from "expo-image-picker";

export default function CreateScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const { currentUser } = useAppStore();

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "You need to allow access to your photos."
      );
      return;
    }
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleShare = async () => {
    if (!selectedImage?.base64 || !currentUser?.serverId)
      return;

    setIsSharing(true);
    try {
      const fileExt =
        selectedImage.uri.split(".").pop()?.toLowerCase() ??
        "jpg";
      const fileName = `${currentUser.serverId}/${new Date().getTime()}.${fileExt}`;

      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("posts")
          .upload(fileName, decode(selectedImage.base64), {
            contentType: `image/${fileExt}`,
          });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("posts")
        .getPublicUrl(uploadData.path);

      const { error: functionError } =
        await supabase.functions.invoke("create-post", {
          body: { image_url: urlData.publicUrl, caption },
        });

      if (functionError) throw functionError;

      Alert.alert("Success!", "Your post has been shared.");
      router.back();
    } catch (error: any) {
      console.error("Error sharing post:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to share post."
      );
    } finally {
      setIsSharing(false);
    }
  };

  // --- UI for when no image is selected ---
  if (!selectedImage) {
    return (
      <View className="flex-1 bg-white dark:bg-black">
        <Stack.Screen options={{ title: "New Post" }} />
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={28}
              color={isDark ? "white" : "black"}
            />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            New Post
          </Text>
          <View className="w-7" />
        </View>
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          onPress={pickImage}
        >
          <Ionicons
            name="image-outline"
            size={48}
            color="#9CA3AF"
          />
          <Text className="mt-4 text-base text-gray-500">
            Tap to select an image
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- UI for after an image has been selected ---
  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios" ? "padding" : "height"
      }
      className="flex-1 bg-white dark:bg-black"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            disabled={isSharing}
          >
            <Ionicons
              name="close-outline"
              size={28}
              color={
                isSharing
                  ? "#6B7280"
                  : isDark
                    ? "white"
                    : "black"
              }
            />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            New Post
          </Text>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${isSharing ? "bg-gray-300 dark:bg-gray-700" : "bg-blue-500"}`}
            disabled={isSharing}
            onPress={handleShare}
          >
            {isSharing ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text className="text-white font-bold">
                Share
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className={`p-4 ${isSharing ? "opacity-50" : ""}`}
          >
            {/* Image Section */}
            <View className="mb-6 relative">
              <Image
                source={{ uri: selectedImage.uri }}
                className="w-full aspect-square rounded-lg"
                contentFit="cover"
              />
              <TouchableOpacity
                className="absolute bottom-3 right-3 bg-black/60 px-3 py-2 rounded-full flex-row items-center"
                onPress={pickImage}
                disabled={isSharing}
              >
                <Ionicons
                  name="image-outline"
                  size={18}
                  color="white"
                />
                <Text className="text-white ml-2 font-semibold">
                  Change
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Section */}
            <View className="flex-row items-start">
              <Image
                source={{ uri: currentUser?.avatarUrl }}
                className="w-10 h-10 rounded-full mr-3"
                contentFit="cover"
              />
              <TextInput
                className="flex-1 text-gray-900 dark:text-white text-base min-h-[100px]"
                placeholder="Write a caption..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={caption}
                onChangeText={setCaption}
                editable={!isSharing}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
