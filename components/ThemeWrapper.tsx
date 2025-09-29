// components/ThemeWrapper.tsx
import React, { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { View } from 'react-native';

const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Web එකට theme apply කරන්න
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolvedTheme);
      document.documentElement.style.colorScheme = resolvedTheme;
      
      // Set background color for web
      document.documentElement.style.backgroundColor = resolvedTheme === 'dark' ? '#0f102fff' : '#f9fafb';
    }
  }, [resolvedTheme]);

  return (
    <View className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-custom-dark' : 'bg-gray-50'}`}>
      {children}
    </View>
  );
};

export default ThemeWrapper;