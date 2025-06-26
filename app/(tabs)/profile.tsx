import Loader from "@/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useAppStore } from "@/stores/appStore";
import { updateUser } from "@/db/actions/userActions";

export default function Profile() {
  const { currentUser, setCurrentUser, logout } = useAppStore();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: currentUser?.name || "",
    dateOfBirth: currentUser?.dateOfBirth || "",
    gender: currentUser?.gender || "",
    heightCm: currentUser?.heightCm || 0,
    currentWeightKg: currentUser?.currentWeightKg || 0,
  });

  if (!currentUser) return <Loader />;

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await updateUser(currentUser, editedProfile);
      setCurrentUser(updatedUser);
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-surface">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-white">
            {currentUser.name}
          </Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity className="p-1" onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* AVATAR & STATS */}
          <View className="flex-row items-center mb-4">
            <View className="mr-8">
              <View
                className="w-[86px] h-[86px] rounded-full items-center justify-center"
                style={{
                  backgroundColor: "#2A2A2A",
                  borderWidth: 2,
                  borderColor: "#2A2A2A",
                }}
              >
                <Text className="text-2xl text-white">
                  {currentUser.name.charAt(0)}
                </Text>
              </View>
            </View>

            <View className="flex-1">
              <View className="mb-4">
                <Text className="text-sm text-grey">Height</Text>
                <Text className="text-lg font-bold text-white">
                  {currentUser.heightCm} cm
                </Text>
              </View>
              <View>
                <Text className="text-sm text-grey">Weight</Text>
                <Text className="text-lg font-bold text-white">
                  {currentUser.currentWeightKg} kg
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-base font-semibold text-white mb-1">
            {currentUser.name}
          </Text>
          <Text className="text-sm text-white mb-2">
            Born: {currentUser.dateOfBirth}
          </Text>
          <Text className="text-sm text-white mb-4">
            Gender: {currentUser.gender}
          </Text>

          <TouchableOpacity
            className="bg-surface p-3 rounded-lg items-center"
            onPress={() => setIsEditModalVisible(true)}
          >
            <Text className="text-white font-semibold">Edit Profile</Text>
          </TouchableOpacity>
        </View>
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
            <View className="bg-background rounded-t-2xl p-5">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-white text-lg font-semibold">
                  Edit Profile
                </Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-grey mb-2">Name</Text>
                <TextInput
                  className="bg-surface rounded-lg p-3 text-white"
                  value={editedProfile.name}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, name: text }))
                  }
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-grey mb-2">Date of Birth</Text>
                <TextInput
                  className="bg-surface rounded-lg p-3 text-white"
                  value={editedProfile.dateOfBirth}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, dateOfBirth: text }))
                  }
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-grey mb-2">Gender</Text>
                <TextInput
                  className="bg-surface rounded-lg p-3 text-white"
                  value={editedProfile.gender}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, gender: text }))
                  }
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-grey mb-2">Height (cm)</Text>
                <TextInput
                  className="bg-surface rounded-lg p-3 text-white"
                  value={String(editedProfile.heightCm)}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      heightCm: Number(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="mb-4">
                <Text className="text-grey mb-2">Weight (kg)</Text>
                <TextInput
                  className="bg-surface rounded-lg p-3 text-white"
                  value={String(editedProfile.currentWeightKg)}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      currentWeightKg: Number(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                className="bg-primary p-4 rounded-lg items-center mt-4"
                onPress={handleSaveProfile}
              >
                <Text className="text-background font-semibold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
