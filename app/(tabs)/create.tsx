import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Keyboard,
} from "react-native";

import { Image } from "expo-image";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);

  const handleShare = async () => {
    if (!selectedImage) return;

    try {
      setIsSharing(true);
      const uploadUrl = await generateUploadUrl();

      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        selectedImage,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: "image/jpeg",
        }
      );

      if (uploadResult.status !== 200) throw new Error("Upload failed");

      const { storageId } = JSON.parse(uploadResult.body);
      await createPost({ storageId, caption });

      setSelectedImage(null);
      setCaption("");

      router.push("/(tabs)");
    } catch (error) {
      console.log("Error sharing post");
    } finally {
      setIsSharing(false);
    }
  };

  if (!selectedImage) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-surface">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#4ADE80" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-white">New Post</Text>
          <View className="w-7" />
        </View>

        <TouchableOpacity
          className="flex-1 justify-center items-center gap-3"
          onPress={pickImage}
        >
          <Ionicons name="image-outline" size={48} color="#9CA3AF" />
          <Text className="text-grey text-base">Tap to select an image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View className="flex-1">
        {/* HEADER */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-surface">
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(null);
              setCaption("");
            }}
            disabled={isSharing}
          >
            <Ionicons
              name="close-outline"
              size={28}
              color={isSharing ? "#9CA3AF" : "#FFFFFF"}
            />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-white">New Post</Text>
          <TouchableOpacity
            className="px-3 py-1.5 min-w-[60px] items-center justify-center disabled:opacity-50"
            disabled={isSharing || !selectedImage}
            onPress={handleShare}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="#4ADE80" />
            ) : (
              <Text className="text-primary text-base font-semibold">
                Share
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className={`flex-1 ${isSharing && "opacity-70"}`}>
            {/* IMAGE SECTION */}
            <View className="w-full aspect-square bg-surface justify-center items-center">
              <Image
                source={selectedImage}
                className="w-full h-full"
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity
                className="absolute bottom-4 right-4 bg-black/[.75] flex-row items-center p-2 rounded-lg gap-1.5"
                onPress={pickImage}
                disabled={isSharing}
              >
                <Ionicons name="image-outline" size={20} color="#FFFFFF" />
                <Text className="text-white text-sm font-medium">Change</Text>
              </TouchableOpacity>
            </View>

            {/* INPUT SECTION */}
            <View className="p-4 flex-1">
              <View className="flex-row items-start">
                <Image
                  source={{ uri: user?.imageUrl }}
                  className="w-9 h-9 rounded-full mr-3"
                />
                <TextInput
                  placeholder="Write a caption..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  onChangeText={setCaption}
                  value={caption}
                  className="flex-1 text-white text-base pt-2 min-h-[100px] max-h-[200px]"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
