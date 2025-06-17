import { Loader } from "@/components/Loader";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { View, Text, ScrollView } from "react-native";

export default function Bookmarks() {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (bookmarkedPosts === undefined) return <Loader />;
  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-surface">
        <Text className="text-2xl font-jetbrains-mono text-primary">
          Bookmarks
        </Text>
      </View>

      {/* POSTS */}
      <ScrollView
        contentContainerStyle={{
          padding: 8,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {bookmarkedPosts.map((post) => {
          if (!post) return null;
          return (
            <View key={post._id} className="w-1/3 p-px">
              <Image
                source={{ uri: post.imageUrl }}
                className="w-full aspect-square"
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function NoBookmarksFound() {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-primary text-2xl">No bookmarked posts yet</Text>
    </View>
  );
}
