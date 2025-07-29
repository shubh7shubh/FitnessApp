import React, { useState, useEffect } from "react";
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

// Define your types in a central file like `types/index.ts`
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
  is_liked: boolean;
};
type PostProps = { post: PostWithAuthor };

export default function Post({
  post: initialPost,
}: PostProps) {
  // This state is now derived from props and will be the single source of truth for the UI
  const [isLiked, setIsLiked] = useState(
    initialPost.is_liked
  );
  const [likeCount, setLikeCount] = useState(
    initialPost.like_count
  );
  const [isLiking, setIsLiking] = useState(false);

  // This is the key: This effect ensures that if the parent data changes (e.g., after a refresh),
  // the component's state updates to match the new reality from the database.
  useEffect(() => {
    setIsLiked(initialPost.is_liked);
    setLikeCount(initialPost.like_count);
  }, [initialPost.is_liked, initialPost.like_count]);

  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update for a snappy UI
    const previousLikeState = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!previousLikeState);
    setLikeCount(
      previousLikeState
        ? previousLikeCount - 1
        : previousLikeCount + 1
    );

    try {
      // The backend handles the "one like per user" rule and returns the true state
      const { data, error } =
        await supabase.functions.invoke("toggle-like", {
          body: { post_id: initialPost.id },
        });

      if (error) {
        throw error; // Let the catch block handle UI reversal
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      // If the server call fails for any reason, revert the UI to its previous state.
      setIsLiked(previousLikeState);
      setLikeCount(previousLikeCount);
      Alert.alert("Error", "Could not update like status.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentPress = () =>
    Alert.alert("Navigate to Comments");

  const getAvatarUrl = () =>
    initialPost.author?.avatar_url ||
    `https://ui-avatars.com/api/?name=${initialPost.author?.username?.charAt(0) || "U"}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: getAvatarUrl() }}
          style={styles.avatar}
        />
        <Text style={styles.username}>
          {initialPost.author?.username || "Unknown"}
        </Text>
      </View>

      {/* Image */}
      <Image
        source={{ uri: initialPost.image_url }}
        style={styles.postImage}
      />

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Pressable
          onPress={handleToggleLike}
          disabled={isLiking}
          style={styles.actionButton}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={28}
            color={isLiked ? "#FF3B30" : "white"}
          />
        </Pressable>
        <Pressable
          onPress={handleCommentPress}
          style={styles.actionButton}
        >
          <Ionicons
            name="chatbubble-outline"
            size={26}
            color="white"
          />
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.likesText}>
          {likeCount.toLocaleString()} likes
        </Text>
        {initialPost.caption && (
          <Text
            style={styles.captionText}
            numberOfLines={2}
          >
            <Text style={styles.usernameFooter}>
              {initialPost.author?.username || "Unknown"}
            </Text>{" "}
            {initialPost.caption}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
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
    paddingTop: 12,
  },
  actionButton: { marginRight: 12 },
  footer: { paddingHorizontal: 12, paddingTop: 8 },
  likesText: { color: "white", fontWeight: "bold" },
  captionText: { color: "white", marginTop: 4 },
  usernameFooter: { fontWeight: "bold" },
});
