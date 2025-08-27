import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Id } from "@/convex/_generated/dataModel";

interface NotificationType {
  _id: Id<"notifications">;
  type: "like" | "comment" | "follow";
  comment?: string;
  _creationTime: number;
  sender: {
    _id: Id<"users">;
    username: string;
    image: string;
  };
  post?: {
    _id: Id<"posts">;
    imageUrl: string;
  };
}

const ICON_STYLES = {
  like: "text-primary",
  comment: "text-blue-500",
  follow: "text-purple-500",
};

const ICON_NAMES = {
  like: "heart",
  comment: "chatbubble",
  follow: "person-add",
};

export default function Notification({
  notification,
}: {
  notification: NotificationType;
}) {
  const iconName = ICON_NAMES[
    notification.type
  ] as keyof typeof Ionicons.glyphMap;
  const iconColor = ICON_STYLES[notification.type];

  return (
    <View className="flex-row justify-between items-center mb-5">
      <View className="flex-1 flex-row items-center mr-3">
        <Link href={`/user/${notification.sender._id}`} asChild>
          <TouchableOpacity className="relative mr-3">
            <Image
              source={{ uri: notification.sender.image }}
              className="w-11 h-11 rounded-full border-2 border-surface"
              contentFit="cover"
              transition={200}
            />
            <View className="absolute -bottom-1 -right-1 bg-background rounded-full w-6 h-6 items-center justify-center border-2 border-surface">
              <Ionicons name={iconName} size={14} className={iconColor} />
            </View>
          </TouchableOpacity>
        </Link>

        <View className="flex-1">
          <Link href={`/user/${notification.sender._id}`} asChild>
            <TouchableOpacity>
              <Text className="text-white text-sm font-semibold mb-0.5">
                {notification.sender.username}
              </Text>
            </TouchableOpacity>
          </Link>

          <Text className="text-grey text-sm mb-0.5" numberOfLines={1}>
            {notification.type === "follow"
              ? "started following you"
              : notification.type === "like"
                ? "liked your post"
                : `commented: "${notification.comment}"`}
          </Text>
          <Text className="text-grey text-xs">
            {formatDistanceToNow(notification._creationTime, {
              addSuffix: true,
            })}
          </Text>
        </View>
      </View>

      {notification.post && (
        <Image
          source={{ uri: notification.post.imageUrl }}
          className="w-11 h-11 rounded-md"
          contentFit="cover"
          transition={200}
        />
      )}
    </View>
  );
}
