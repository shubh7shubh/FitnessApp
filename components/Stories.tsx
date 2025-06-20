import { STORIES } from "@/constants/mock-data";
import { ScrollView } from "react-native";
import Story from "./Story";

const StoriesSection = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-3 border-b border-surface"
    >
      {STORIES.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </ScrollView>
  );
};

export default StoriesSection;
