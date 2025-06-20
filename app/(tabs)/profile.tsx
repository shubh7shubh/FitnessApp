import { Loader } from "@/components/Loader";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image as RNImage,
} from "react-native";

export default function Profile() {
  const { signOut, userId } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const [editedProfile, setEditedProfile] = useState({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
  });

  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);
  const posts = useQuery(
    api.posts.getPostsByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const updateProfile = useMutation(api.users.updateProfile);

  const handleSaveProfile = async () => {
    await updateProfile(editedProfile);
    setIsEditModalVisible(false);
  };

  if (!currentUser || posts === undefined) return <Loader />;

  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-surface">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-white">
            {currentUser.username}
          </Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity className="p-1" onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* AVATAR & STATS */}
          <View className="flex-row items-center mb-4">
            <View className="mr-8">
              <RNImage
                source={{ uri: currentUser.image }}
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 43,
                  borderWidth: 2,
                  borderColor: "#2A2A2A",
                }}
                resizeMode="cover"
              />
            </View>

            <View className="flex-1 flex-row justify-around">
              <View className="items-center">
                <Text className="text-lg font-bold text-white mb-1">
                  {currentUser.posts}
                </Text>
                <Text className="text-sm text-grey">Posts</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-white mb-1">
                  {currentUser.followers}
                </Text>
                <Text className="text-sm text-grey">Followers</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-white mb-1">
                  {currentUser.following}
                </Text>
                <Text className="text-sm text-grey">Following</Text>
              </View>
            </View>
          </View>

          <Text className="text-base font-semibold text-white mb-1">
            {currentUser.fullname}
          </Text>
          {currentUser.bio && (
            <Text className="text-sm text-white leading-5">
              {currentUser.bio}
            </Text>
          )}

          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity
              className="flex-1 bg-surface p-2 rounded-lg items-center"
              onPress={() => setIsEditModalVisible(true)}
            >
              <Text className="text-white font-semibold text-sm">
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-surface p-2 rounded-lg aspect-square items-center justify-center">
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {posts.length === 0 && <NoPostsFound />}

        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-1/3 aspect-square p-px"
              onPress={() => setSelectedPost(item)}
            >
              <RNImage
                source={{ uri: item.imageUrl }}
                style={{ flex: 1 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-end bg-black/50"
          >
            <View className="bg-background rounded-t-2xl p-5 min-h-[400px]">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-white text-lg font-semibold">
                  Edit Profile
                </Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View className="mb-5">
                <Text className="text-grey mb-2 text-sm">Name</Text>
                <TextInput
                  className="bg-surface rounded-lg p-3 text-white text-base"
                  value={editedProfile.fullname}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, fullname: text }))
                  }
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-5">
                <Text className="text-grey mb-2 text-sm">Bio</Text>
                <TextInput
                  className="bg-surface rounded-lg p-3 text-white text-base h-24"
                  value={editedProfile.bio}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, bio: text }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                className="bg-primary p-4 rounded-lg items-center mt-5"
                onPress={handleSaveProfile}
              >
                <Text className="text-background text-base font-semibold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* SELECTED IMAGE MODAL */}
      <Modal
        visible={!!selectedPost}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
      >
        <View className="flex-1 justify-center bg-black/90">
          {selectedPost && (
            <View className="bg-background max-h-[90%]">
              <View className="flex-row items-center justify-end p-3 border-b border-surface">
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Image
                source={selectedPost.imageUrl}
                cachePolicy={"memory-disk"}
                className="w-full aspect-square"
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function NoPostsFound() {
  return (
    <View className="h-full bg-background justify-center items-center">
      <Ionicons name="images-outline" size={48} color="#4ADE80" />
      <Text className="text-xl text-white">No posts yet</Text>
    </View>
  );
}
