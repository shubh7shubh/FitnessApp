import { Loader } from "@/components/Loader";
import Notification from "@/components/Notification";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { FlatList, Text, View } from "react-native";

export default function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications);

  if (notifications === undefined) return <Loader />;
  if (notifications.length === 0) return <NoNotificationsFound />;

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-3 border-b border-surface">
        <Text className="text-2xl font-jetbrains-mono text-primary">
          Notifications
        </Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => <Notification notification={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

function NoNotificationsFound() {
  return (
    <View className="flex-1 bg-background justify-center items-center">
      <Ionicons name="notifications-outline" size={48} color="#4ADE80" />
      <Text className="text-xl text-white">No notifications yet</Text>
    </View>
  );
}
