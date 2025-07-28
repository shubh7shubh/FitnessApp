import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { supabase } from "@/lib/supabase";

export default function CommentsScreen() {
  const router = useRouter();
  const { post_id, post_author_id } = useLocalSearchParams<{
    post_id: string;
    post_author_id: string;
  }>();

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Function to fetch all comments for this post
  const fetchComments = useCallback(async () => {
    if (!post_id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`*, author:profiles(*)`) // Join with profiles to get author info
        .eq("post_id", post_id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [post_id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const { data: createdComment, error } =
        await supabase.functions.invoke("create-comment", {
          body: { post_id: post_id, content: newComment },
        });
      if (error) throw error;

      // Add the new comment to the top of the list instantly (Optimistic Update)
      setComments((currentComments) => [
        ...currentComments,
        createdComment,
      ]);
      setNewComment("");
    } catch (error: any) {
      Alert.alert("Error", "Could not post your comment.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ title: "Comments" }} />

      {isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="p-4 flex-row">
              <Image
                source={{ uri: item.author?.avatar_url }}
                className="w-8 h-8 rounded-full"
              />
              <View className="ml-3 flex-1">
                <Text className="text-white font-bold">
                  {item.author?.username}
                </Text>
                <Text className="text-gray-300">
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-gray-500 text-center mt-10">
              No comments yet. Be the first!
            </Text>
          }
        />
      )}

      {/* Comment Input Box */}
      <View className="p-4 border-t border-gray-800 flex-row items-center">
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor="#888"
          className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2"
        />
        <Pressable
          onPress={handleAddComment}
          disabled={isPosting}
          className="ml-3"
        >
          <Text className="text-green-500 font-bold">
            {isPosting ? "Posting..." : "Post"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
