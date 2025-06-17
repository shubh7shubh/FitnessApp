import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import StoriesSection from "@/components/Stories";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";

export default function Index() {
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const posts = useQuery(api.posts.getFeedPosts);

  if (posts === undefined) return <Loader />;
  if (posts.length === 0) return <NoPostsFound />;

  // this does nothing
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-surface">
        <Text className="text-2xl font-jetbrains-mono text-primary">
          fitness
        </Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={<StoriesSection />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4ADE80"
          />
        }
      />
    </View>
  );
}

const NoPostsFound = () => (
  <View className="flex-1 bg-background justify-center items-center">
    <Text className="text-xl text-primary">No posts yet</Text>
  </View>
);
