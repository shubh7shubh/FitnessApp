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
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/constants/theme";

export default function CommentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const isDark = colorScheme === "dark";

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
        .select(`*, author:profiles(*)`)
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
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Header */}
      <View
        className={`${isDark ? "bg-gray-800" : "bg-white"} border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 h-8 items-center justify-center rounded-full mr-3"
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={isDark ? "#D1D5DB" : "#6B7280"}
              />
            </TouchableOpacity>
            <Text
              className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Comments
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00D4AA" />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          renderItem={({ item }) => (
            <View className="flex-row mb-4">
              <Image
                source={{
                  uri:
                    item.author?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${item.author?.username?.charAt(0) || "U"}&background=${isDark ? "374151" : "E5E7EB"}&color=${isDark ? "F9FAFB" : "1F2937"}`,
                }}
                className="w-8 h-8 rounded-full"
              />
              <View className="ml-3 flex-1">
                <Text
                  className={`font-semibold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {item.author?.username || "Unknown"}
                </Text>
                <Text
                  className={`text-sm leading-5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons
                name="chatbubble-outline"
                size={48}
                color={isDark ? "#6B7280" : "#9CA3AF"}
                className="mb-4"
              />
              <Text
                className={`text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                No comments yet. Be the first!
              </Text>
            </View>
          }
        />
      )}

      {/* Comment Input */}
      <View
        className={`${isDark ? "bg-gray-800" : "bg-white"} border-t ${isDark ? "border-gray-700" : "border-gray-200"} px-4 py-3`}
      >
        <View className="flex-row items-end">
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            placeholderTextColor={
              isDark ? "#6B7280" : "#9CA3AF"
            }
            className={`flex-1 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"} rounded-2xl px-4 py-2 max-h-24`}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={isPosting || !newComment.trim()}
            className={`ml-3 w-10 h-10 items-center justify-center rounded-full ${
              newComment.trim()
                ? "bg-teal-500"
                : isDark
                  ? "bg-gray-600"
                  : "bg-gray-300"
            }`}
          >
            {isPosting ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <Ionicons
                name="send"
                size={16}
                color={
                  newComment.trim()
                    ? "white"
                    : isDark
                      ? "#9CA3AF"
                      : "#6B7280"
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
