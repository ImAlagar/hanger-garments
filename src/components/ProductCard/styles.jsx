import { useTheme } from "../../context/ThemeContext";

export const useProductCardStyles = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return {
    theme,
    isDark,
    textColor: isDark ? "text-white" : "text-black",
    subText: isDark ? "text-gray-400" : "text-gray-600",
    discountText: isDark ? "text-red-400" : "text-red-600",
    cardBg: isDark ? "bg-gray-900" : "bg-white",
    buttonBg: isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200",
    modalBg: isDark ? "bg-gray-800" : "bg-white",
    modalText: isDark ? "text-white" : "text-gray-900",
  };
};