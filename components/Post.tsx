import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { userSchema } from "@/db/schemas/userSchema";

type AuthorProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type PostWithAuthor = {
  id: string;
  caption: string | null;
  image_url: string;
  like_count: number;
  created_at: string;
  author: AuthorProfile | null;
  // This new field will be provided by our backend
  is_liked: boolean;
};

type PostProps = {
  post: PostWithAuthor;
};

export default function Post({
  post: initialPost,
}: PostProps) {
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(
    initialPost.is_liked
  );
  const [isLiking, setIsLiking] = useState(false);
  const router = useRouter();

  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // --- Optimistic UI Update ---
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setPost((currentPost) => ({
      ...currentPost,
      like_count: wasLiked
        ? currentPost.like_count - 1
        : currentPost.like_count + 1,
    }));

    try {
      // Call the 'toggle-like' Edge Function we created earlier
      await supabase.functions.invoke("toggle-like", {
        body: { post_id: post.id },
      });
      // We don't need to do anything with the response because our UI is already updated.
      // The real-time subscription in FeedsScreen will handle the final state.
    } catch (error: any) {
      console.error("Error toggling like:", error);
      // If the server fails, revert the optimistic update
      setIsLiked(wasLiked);
      setPost(initialPost);
      Alert.alert("Error", "Could not update like status.");
    } finally {
      setIsLiking(false);
    }
  };

  // Helper to get a default avatar if the user's is missing
  const getAvatarUrl = () => {
    return (
      post.author?.avatar_url ||
      `https://placehold.co/32x32/1a1a1a/ffffff?text=${post.author?.username?.charAt(0) || "U"}`
    );
  };

  const postAuthorId = initialPost.author?.id;

  const openComments = () => {
    router.push({
      pathname: "/(modals)/comments",
      params: {
        post_id: initialPost.id,
        post_author_id: postAuthorId,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Post Header with Author Info */}
      <View style={styles.header}>
        <Image
          source={{ uri: getAvatarUrl() }}
          style={styles.avatar}
        />
        <Text style={styles.username}>
          {post.author?.username || "Unknown User"}
        </Text>
      </View>

      {/* Post Image */}
      <Image
        source={{ uri: post.image_url }}
        style={styles.postImage}
      />

      {/* Action Buttons (Like, Comment) */}
      <View style={styles.actionsContainer}>
        <Pressable
          onPress={handleToggleLike}
          disabled={isLiking}
          style={styles.actionButton}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={28}
            color={isLiked ? "red" : "white"}
          />
        </Pressable>
        <Pressable
          onPress={openComments}
          style={styles.actionButton}
        >
          <Ionicons
            name="chatbubble-outline"
            size={26}
            color="white"
          />
        </Pressable>
      </View>

      {/* Like Count and Caption */}
      <View style={styles.footer}>
        <Text style={styles.likesText}>
          {post.like_count.toLocaleString()} likes
        </Text>
        <Text style={styles.captionText}>
          <Text style={styles.usernameFooter}>
            {post.author?.username || "Unknown"}
          </Text>{" "}
          {post.caption}
        </Text>
      </View>
    </View>
  );
}

// Using StyleSheet for a clean and organized component
const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "#121212", // A slightly different background for posts
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#333",
  },
  username: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#222",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButton: {
    marginRight: 12,
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  likesText: {
    color: "white",
    fontWeight: "bold",
  },
  captionText: {
    color: "white",
    marginTop: 4,
  },
  usernameFooter: {
    fontWeight: "bold",
  },
});
