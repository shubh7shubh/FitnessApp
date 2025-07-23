import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import Post from "@/components/Post"; // Make sure you have this component created

export default function FeedsScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch posts from Supabase
  const fetchPosts = useCallback(async () => {
    // Note: We don't set isLoading to true here on purpose
    // so the refresh doesn't show a full-screen loader.
    const { data, error } = await supabase
      .from("posts")
      .select(`*, author:profiles!posts_user_id_fkey(*)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Feed Fetch Error:", error);
      Alert.alert("Error", "Could not fetch the feed.");
    } else {
      setPosts(data || []);
    }
    setIsLoading(false); // Stop all loading indicators
  }, []);

  useEffect(() => {
    // 1. Initial fetch when the component loads
    fetchPosts();

    // 2. Set up a real-time listener for any changes in the 'posts' table
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          console.log(
            "Real-time change received!",
            payload
          );
          // The simplest and most reliable way to handle real-time updates
          // is to just re-fetch the entire list.
          fetchPosts();
        }
      )
      .subscribe();

    // 3. Clean up the listener when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  // Show a loading indicator only on the very first load
  if (isLoading && posts.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <Pressable onPress={() => router.push("/create")}>
          <Ionicons
            name="add-circle-outline"
            size={32}
            color="white"
          />
        </Pressable>
      </View>

      {/* List of Posts */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />} // Ensure your Post component is ready
        keyExtractor={(item) => item.id}
        onRefresh={fetchPosts} // Enables pull-to-refresh
        refreshing={isLoading}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Using StyleSheet for clarity
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
