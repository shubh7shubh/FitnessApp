import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

export default function CreateScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const pickImage = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleShare = async () => {
    if (!selectedImage?.base64) {
      return Alert.alert(
        "Error",
        "Please select an image to share."
      );
    }

    setIsSharing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user)
        throw new Error("User not found. Please log in.");

      console.log("Currently logged-in User ID:", user.id);

      // 2. Create a unique file name
      const fileExt =
        selectedImage.uri.split(".").pop()?.toLowerCase() ??
        "jpg";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // 3. Upload the image to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("posts")
          .upload(fileName, decode(selectedImage.base64), {
            contentType: `image/${fileExt}`,
            upsert: false,
          });

      if (uploadError) throw uploadError;

      // 4. Get the public URL of the uploaded image
      const { data: urlData } = supabase.storage
        .from("posts")
        .getPublicUrl(uploadData.path);

      // 5. Call the 'create-post' Edge Function
      const { error: functionError } =
        await supabase.functions.invoke("create-post", {
          body: {
            image_url: urlData.publicUrl,
            caption: caption,
          },
        });

      if (functionError) throw functionError;

      // 6. If successful, show an alert and go back to the previous screen
      Alert.alert("Success!", "Your post has been shared.");
      router.back();
    } catch (error: any) {
      console.error("Share Post Error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to share post."
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios" ? "padding" : "height"
      }
      style={styles.container}
    >
      <Stack.Screen options={{ title: "Create Post" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.imagePicker}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.image}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="camera"
                size={50}
                color="#555"
              />
              <Text style={styles.imagePlaceholderText}>
                Tap to select an image
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Write a caption..."
          placeholderTextColor="#999"
          style={styles.input}
          multiline
        />

        <TouchableOpacity
          onPress={handleShare}
          style={styles.button}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Share</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Using StyleSheet for clarity
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  content: { flexGrow: 1, padding: 16 },
  imagePicker: {
    aspectRatio: 1,
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: "#777",
    marginTop: 8,
  },
  image: { width: "100%", height: "100%" },
  input: {
    color: "white",
    fontSize: 16,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
