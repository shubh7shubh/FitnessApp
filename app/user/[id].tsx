import { Loader } from "@/components/Loader";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import cn from "classnames";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const profile = useQuery(api.users.getUserProfile, { id: id as Id<"users"> });
  const posts = useQuery(api.posts.getPostsByUser, {
    userId: id as Id<"users">,
  });
  const isFollowing = useQuery(api.users.isFollowing, {
    followingId: id as Id<"users">,
  });

  const toggleFollow = useMutation(api.users.toggleFollow);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (profile === undefined || posts === undefined || isFollowing === undefined)
    return <Loader />;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-surface">
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-white">
          {profile.username}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <View className="flex-row items-center mb-4">
            {/* AVATAR */}
            <Image
              source={{ uri: profile.image }}
              className="w-[86px] h-[86px] rounded-full border-2 border-surface mr-8"
              contentFit="cover"
              cachePolicy="memory-disk"
              placeholder="L6PZfSi_.AyE_3t7t7RkTJt7c2fk"
            />

            {/* STATS */}
            <View className="flex-1 flex-row justify-around">
              <View className="items-center">
                <Text className="text-lg font-bold text-white mb-1">
                  {profile.posts}
                </Text>
                <Text className="text-sm text-grey">Posts</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-white mb-1">
                  {profile.followers}
                </Text>
                <Text className="text-sm text-grey">Followers</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-white mb-1">
                  {profile.following}
                </Text>
                <Text className="text-sm text-grey">Following</Text>
              </View>
            </View>
          </View>

          <Text className="text-base font-semibold text-white mb-1">
            {profile.fullname}
          </Text>
          {profile.bio && (
            <Text className="text-sm text-white leading-5">{profile.bio}</Text>
          )}

          <Pressable
            className={cn(
              "py-2 px-6 rounded-lg mt-4",
              isFollowing ? "bg-surface border border-primary" : "bg-primary"
            )}
            onPress={() => toggleFollow({ followingId: id as Id<"users"> })}
          >
            <Text
              className={cn(
                "text-sm font-semibold text-center",
                isFollowing ? "text-white" : "text-background"
              )}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>

        <View className="flex-1 flex-row flex-wrap justify-between">
          {posts.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12 gap-3">
              <Ionicons name="images-outline" size={48} color="#9CA3AF" />
              <Text className="text-grey text-base">No posts yet</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity className="w-1/3 aspect-square p-px">
                  <Image
                    source={item.imageUrl}
                    className="flex-1"
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
