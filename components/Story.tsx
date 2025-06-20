import { View, Text, Image, TouchableOpacity } from "react-native";
import cn from "classnames";

type Story = {
  id: string;
  username: string;
  avatar: string;
  hasStory: boolean;
};

export default function Story({ story }: { story: Story }) {
  return (
    <TouchableOpacity className="items-center mx-2 w-[72px]">
      <View
        className={cn(
          "w-[68px] h-[68px] rounded-full p-0.5 bg-background border-2 mb-1",
          story.hasStory ? "border-primary" : "border-grey"
        )}
      >
        <Image
          source={{ uri: story.avatar }}
          className="w-[60px] h-[60px] rounded-full border-2 border-background"
        />
      </View>
      <Text className="text-xs text-white text-center">{story.username}</Text>
    </TouchableOpacity>
  );
}
