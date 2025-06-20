import { useColorScheme } from "react-native";
import {
  COLORS,
  FITNESS_COLORS,
  type Theme,
  type ColorScheme,
} from "@/constants/theme";

export const useTheme = () => {
  const systemTheme = useColorScheme();
  const theme: Theme = systemTheme === "dark" ? "dark" : "light";
  const colors: ColorScheme = COLORS[theme];

  return {
    theme,
    colors,
    fitnessColors: FITNESS_COLORS,
    isDark: theme === "dark",
    isLight: theme === "light",
  };
};
