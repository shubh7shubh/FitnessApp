import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";

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
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  
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

  const handleCommentPress = () => {
    router.push({
      pathname: "/(modals)/comments",
      params: { 
        post_id: initialPost.id,
        post_author_id: initialPost.author?.id || ""
      }
    });
  };

  const getAvatarUrl = () => {
    if (initialPost.author?.avatar_url) {
      return initialPost.author.avatar_url;
    }
    const firstLetter = initialPost.author?.username?.charAt(0) || "U";
    return `https://ui-avatars.com/api/?name=${firstLetter}&background=4ADE80&color=fff&size=128`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Image
          source={{ uri: getAvatarUrl() }}
          style={styles.avatar}
        />
        <Text style={[styles.username, { color: colors.text.primary }]}>
          {initialPost.author?.username || "Unknown"}
        </Text>
      </View>

      {/* Image */}
      <Image
        source={{ uri: initialPost.image_url }}
        style={styles.postImage}
      />

      {/* Actions */}
      <View style={[styles.actionsContainer, { backgroundColor: colors.background }]}>
        <Pressable
          onPress={handleToggleLike}
          disabled={isLiking}
          style={styles.actionButton}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={28}
            color={isLiked ? "#FF3B30" : colors.text.primary}
          />
        </Pressable>
        <Pressable
          onPress={handleCommentPress}
          style={styles.actionButton}
        >
          <Ionicons
            name="chatbubble-outline"
            size={26}
            color={colors.text.primary}
          />
        </Pressable>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Text style={[styles.likesText, { color: colors.text.primary }]}>
          {likeCount.toLocaleString()} likes
        </Text>
        {initialPost.caption && (
          <Text
            style={[styles.captionText, { color: colors.text.primary }]}
            numberOfLines={2}
          >
            <Text style={[styles.usernameFooter, { color: colors.text.primary }]}>
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
  container: { 
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#333",
  },
  username: {
    fontWeight: "600",
    marginLeft: 14,
    fontSize: 17,
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#222",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  actionButton: { 
    marginRight: 20,
    padding: 6,
  },
  footer: { 
    paddingHorizontal: 20, 
    paddingTop: 10,
    paddingBottom: 20,
  },
  likesText: { 
    fontWeight: "600",
    fontSize: 16,
  },
  captionText: { 
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
  },
  usernameFooter: { 
    fontWeight: "600",
  },
});
