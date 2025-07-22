// src/components/Post.tsx

import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable, Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
};

type PostType = {
  id: string;
  caption: string;
  image_url: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  user_id: string;
};

// Define the type for the component's props
type PostProps = {
  post: PostType;
};

export default function Post({ post: initialPost }: PostProps) {
  // Use local state for immediate UI feedback (optimistic updates)
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(false); // We need to check initial like status
  const [isLiking, setIsLiking] = useState(false);

  // We need to know who the current user is
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndLikeStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Check if the current user has already liked this post
      if (user) {
        const { data, error } = await supabase
          .from("likes")
          .select("*", { count: "exact" })
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (data && data.length > 0) {
          setIsLiked(true);
        }
      }
    };
    fetchUserAndLikeStatus();
  }, [post.id]);

  const handleToggleLike = async () => {
    if (!currentUserId)
      return Alert.alert("You must be logged in to like a post.");
    if (isLiking) return;

    setIsLiking(true);

    // --- Optimistic UI Update ---
    // Immediately update the UI before waiting for the server
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setPost((currentPost) => ({
      ...currentPost,
      like_count: wasLiked
        ? currentPost.like_count - 1
        : currentPost.like_count + 1,
    }));

    try {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke("toggle-like", {
        body: { post_id: post.id },
      });

      if (error) {
        // If the server fails, revert the optimistic update
        setIsLiked(wasLiked);
        setPost(initialPost); // Revert to original post data
        throw error;
      }

      // The server response `data.liked` confirms the final state
      console.log("Server confirmed like status:", data.liked);
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Could not update like status.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <View className="p-4 mb-4 bg-gray-900">
      {/* Post Header with Author Info */}
      <View className="flex-row items-center mb-2">
        <Image
          source={{
            uri: "https://via.placeholder.com/32", // Placeholder for now
          }}
          className="w-8 h-8 rounded-full"
        />
        <Text className="text-white font-bold ml-2">
          {/* Placeholder for now */}
          {post.user_id}
        </Text>
      </View>

      {/* Post Image */}
      <Image
        source={{ uri: post.image_url }}
        className="w-full aspect-square rounded-lg"
      />

      {/* Action Buttons (Like, Comment) */}
      <View className="flex-row items-center mt-2">
        <Pressable onPress={handleToggleLike} disabled={isLiking}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={28}
            color={isLiked ? "red" : "white"}
          />
        </Pressable>
        {/* Add comment button here */}
      </View>

      {/* Like Count and Caption */}
      <Text className="text-white font-bold mt-1">{post.like_count} likes</Text>
      <Text className="text-white mt-1">
        <Text className="font-bold">
          {/* Placeholder for now */}
          {post.user_id}
        </Text>{" "}
        {post.caption}
      </Text>
    </View>
  );
}
