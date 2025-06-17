import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, Image as RNImage } from "react-native";
import CommentsModal from "./CommentsModal";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-expo";

type PostProps = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
    };
  };
};

export default function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);

  const [showComments, setShowComments] = useState(false);

  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);

  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike({ postId: post._id });
      setIsLiked(newIsLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async () => {
    const newIsBookmarked = await toggleBookmark({ postId: post._id });
    setIsBookmarked(newIsBookmarked);
  };

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post._id });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <View className="mb-4">
      {/* POST HEADER */}
      <View className="flex-row items-center justify-between p-3">
        <Link
          href={
            currentUser?._id === post.author._id
              ? "/(tabs)/profile"
              : `/user/${post.author._id}`
          }
          asChild
        >
          <TouchableOpacity className="flex-row items-center">
            <RNImage
              source={{ uri: post.author.image }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginRight: 8,
              }}
              resizeMode="cover"
            />
            <Text className="text-sm font-semibold text-white">
              {post.author.username}
            </Text>
          </TouchableOpacity>
        </Link>

        {/* if i'm the owner of the post, show the delete button  */}
        {post.author._id === currentUser?._id ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#4ADE80" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* IMAGE */}
      <RNImage
        source={{ uri: post.imageUrl }}
        style={{ width: "100%", aspectRatio: 1 }}
        resizeMode="cover"
      />

      {/* POST ACTIONS */}
      <View className="flex-row justify-between items-center px-3 py-3">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#4ADE80" : "#FFFFFF"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons name="chatbubble-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* POST INFO */}
      <View className="px-3">
        <Text className="text-sm font-semibold text-white mb-1.5">
          {post.likes > 0
            ? `${post.likes.toLocaleString()} likes`
            : "Be the first to like"}
        </Text>
        {post.caption && (
          <View className="flex-row flex-wrap mb-1.5">
            <Text className="text-sm font-semibold text-white mr-1.5">
              {post.author.username}
            </Text>
            <Text className="text-sm text-white flex-1">{post.caption}</Text>
          </View>
        )}

        {post.comments > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text className="text-sm text-grey mb-1">
              View all {post.comments} comments
            </Text>
          </TouchableOpacity>
        )}

        <Text className="text-xs text-grey mb-2">
          {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>

      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}
