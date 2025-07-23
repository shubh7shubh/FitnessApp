import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Post from "@/components/Post";
import { useAppStore } from "@/stores/appStore";
import { supabase } from "./../../../lib/supabase";

export default function FeedsScreen() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch the initial list of posts
  const fetchPosts = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // Fetch posts with user information from auth.users
      const { data, error } =
        await supabase.rpc("get_feed");

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Could not fetch the feed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Fetch initial data when the screen loads
    fetchPosts();

    // 2. Set up a real-time listener for NEW posts
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log(
            "Real-time: New post received!",
            payload.new
          );
          // To get the author info for the new post, we need to fetch it
          // A more advanced setup would use a database function for this
          fetchPosts(); // For simplicity, we just re-fetch the whole feed
        }
      )
      .subscribe();

    // 3. Clean up the listener when the user navigates away
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]); // Re-run if the user changes

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      {/* Custom Header */}
      <View className="flex-row items-center justify-between p-4 pt-12">
        <Text className="text-white text-2xl font-bold">
          Feed
        </Text>
        <Pressable onPress={() => router.push("/create")}>
          <Ionicons
            name="add-circle-outline"
            size={28}
            color="white"
          />
        </Pressable>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item.id}
        onRefresh={fetchPosts}
        refreshing={isLoading}
      />
    </View>
  );
}
