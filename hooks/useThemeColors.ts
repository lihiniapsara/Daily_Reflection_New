// hooks/useThemeColors.ts

import { useTheme } from "@/context/ThemeContext";

export const useThemeColors = () => {
  const { resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === 'dark';
  
  return {
    isDark,
    
    // Background colors - Custom dark color #0f102fff for dark theme
    background: isDark ? 'bg-custom-dark' : 'bg-gray-50',
    backgroundClass: isDark ? 'bg-custom-dark' : 'bg-gray-50',
    
    // Text colors - WHITE for dark theme
    text: isDark ? 'text-white' : 'text-gray-900',
    textClass: isDark ? 'text-white' : 'text-gray-900',
    
    // Secondary text colors
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textSecondaryClass: isDark ? 'text-gray-300' : 'text-gray-600',
    
    // Card colors - Slightly darker than background (#111827)
    card: isDark ? 'bg-gray-900' : 'bg-white',
    cardClass: isDark ? 'bg-gray-900' : 'bg-white',
    
    // Border colors
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    borderClass: isDark ? 'border-gray-700' : 'border-gray-200',
    
    // Input colors
    input: isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300',
    inputClass: isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300',
    
    // Button colors
    button: isDark ? 'bg-blue-600' : 'bg-blue-500',
    buttonClass: isDark ? 'bg-blue-600' : 'bg-blue-500',
    
    // Button text colors
    buttonText: isDark ? 'text-white' : 'text-white',
    buttonTextClass: isDark ? 'text-white' : 'text-white',
    
    // Icon colors
    icon: isDark ? 'text-gray-300' : 'text-gray-600',
    iconClass: isDark ? 'text-gray-300' : 'text-gray-600',
    
    // Header colors - Same custom dark color
    header: isDark ? 'bg-custom-dark' : 'bg-white',
    headerClass: isDark ? 'bg-custom-dark' : 'bg-white',
    
    headerText: isDark ? 'text-white' : 'text-gray-900',
    headerTextClass: isDark ? 'text-white' : 'text-gray-900',
    
    // Modal colors
    modal: isDark ? 'bg-gray-800' : 'bg-white',
    modalClass: isDark ? 'bg-gray-800' : 'bg-white',
    
    modalText: isDark ? 'text-white' : 'text-gray-900',
    modalTextClass: isDark ? 'text-white' : 'text-gray-900',
    
    // Additional colors
    moodButton: isDark ? 'bg-gray-800' : 'bg-gray-100',
    moodButtonClass: isDark ? 'bg-gray-800' : 'bg-gray-100',
    
    moodButtonText: isDark ? 'text-white' : 'text-gray-800',
    moodButtonTextClass: isDark ? 'text-white' : 'text-gray-800',
  };
};