import { View, Text } from "react-native"
import React from "react"
import { Tabs } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"
import { useColorScheme } from "react-native"
import { useTheme } from '@/context/ThemeContext'

const tabs = [
  { label: "Home", name: "home", icon: "home-filled" },
  { label: "Journal", name: "journal", icon: "menu-book" },
  { label: "Goal", name: "goal", icon: "flag" },
  { label: "Settings", name: "setting", icon: "settings" },
  
] as const

const DashboardLayout = () => {
  const colorScheme = useColorScheme()
  const { theme } = useTheme()
  
  // Determine the actual theme to use (system, light, or dark)
  const currentTheme = theme === 'system' ? colorScheme : theme
  const isDark = currentTheme === 'dark'

  // Theme colors
  const tabBarBackground = isDark ? "#1a1a1a" : "#ffffff"
  const tabBarActiveTint = isDark ? "#d109f5ff" : "#d109f5ff" // Keep purple for both themes
  const tabBarInactiveTint = isDark ? "#888" : "#999"
  const tabBarBorder = isDark ? "#333" : "#e5e5e5"

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTint,
        tabBarInactiveTintColor: tabBarInactiveTint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopColor: tabBarBorder,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {tabs.map(({ name, icon, label }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={icon} color={color} size={size} />
            )
          }}
        />
      ))}
    </Tabs>
  )
}

export default DashboardLayout