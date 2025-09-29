import React, { memo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  Linking,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from '@/context/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors'; // Import the theme hook

// Type definitions for options
interface SettingOption {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  toggle?: boolean;
  extraText?: string;
  action?: () => void;
}

interface Section {
  title: string;
  options: SettingOption[];
}

// Theme options
const themes = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
];

// Reminder times
const reminderTimes = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", 
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", 
  "8:00 PM", "9:00 PM", "10:00 PM"
];

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const systemTheme = useColorScheme() || 'light';
  const [searchQuery, setSearchQuery] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("9:00 PM");
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [appVersion] = useState("1.2.3");
  
  // Use theme colors
  const {
    isDark,
    backgroundClass,
    textClass,
    textSecondaryClass,
    cardClass,
    borderClass,
    inputClass,
    buttonClass,
    buttonTextClass,
    headerClass,
    headerTextClass,
    modalClass,
    modalTextClass,
  } = useThemeColors();

  // Load saved settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedReminders = await AsyncStorage.getItem('remindersEnabled');
      if (savedReminders !== null) setRemindersEnabled(JSON.parse(savedReminders));

      const savedReminderTime = await AsyncStorage.getItem('reminderTime');
      if (savedReminderTime) setReminderTime(savedReminderTime);

      const savedPasscode = await AsyncStorage.getItem('passcodeEnabled');
      if (savedPasscode !== null) setPasscodeEnabled(JSON.parse(savedPasscode));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    await setTheme(newTheme as 'light' | 'dark' | 'system');
    Alert.alert("Theme Changed", `Theme set to ${themes.find(t => t.id === newTheme)?.name}`);
  };

  const handleRemindersToggle = async (value: boolean) => {
    setRemindersEnabled(value);
    await saveSetting('remindersEnabled', value);
  };

  const handleReminderTimeChange = async (time: string) => {
    setReminderTime(time);
    await saveSetting('reminderTime', time);
    Alert.alert("Reminder Time Changed", `Reminders set for ${time}`);
  };

  const handlePasscodeToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        "Passcode Lock", 
        "Set up a passcode to secure your journal entries",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setPasscodeEnabled(false)
          },
          {
            text: "Set Passcode",
            onPress: async () => {
              setPasscodeEnabled(true);
              await saveSetting('passcodeEnabled', true);
              Alert.alert("Success", "Passcode lock enabled");
            }
          }
        ]
      );
    } else {
      setPasscodeEnabled(false);
      await saveSetting('passcodeEnabled', false);
      Alert.alert("Passcode Disabled", "Passcode lock has been turned off");
    }
  };

  const handleDataBackup = () => {
    Alert.alert(
      "Data Backup", 
      "Backup your journal data to the cloud?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Backup Now",
          onPress: () => Alert.alert("Backup Started", "Your data is being backed up securely")
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data", 
      "Export your journal data as a PDF or text file?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "PDF",
          onPress: () => Alert.alert("PDF Export", "Preparing your journal as a PDF...")
        },
        {
          text: "Text File",
          onPress: () => Alert.alert("Text Export", "Preparing your journal as a text file...")
        }
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@journalapp.com?subject=Journal App Support Request');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  const handleRateApp = () => {
    Alert.alert("Rate App", "Would you like to rate our app in the store?", [
      {
        text: "Not Now",
        style: "cancel"
      },
      {
        text: "Rate Now",
        onPress: () => Linking.openURL('https://example.com/app-store-link')
      }
    ]);
  };

  const handleFAQs = () => {
    Alert.alert("FAQs", "Frequently Asked Questions will be shown here");
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data", 
      "This will permanently delete all your journal entries. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () => Alert.alert("Data Cleared", "All your journal entries have been deleted")
        }
      ]
    );
  };

  const sections: Section[] = [
    {
      title: "Appearance",
      options: [
        { 
          id: "theme", 
          title: "Theme", 
          icon: "moon" as const, 
          extraText: themes.find(t => t.id === theme)?.name,
          action: () => {
            Alert.alert(
              "Select Theme",
              "Choose your preferred theme",
              themes.map(t => ({
                text: t.name,
                onPress: () => handleThemeChange(t.id),
                style: theme === t.id ? "default" : "cancel"
              }))
            );
          }
        },
      ],
    },
    {
      title: "Notifications",
      options: [
        {
          id: "reminders",
          title: "Daily Reminders",
          icon: "notifications" as const,
          toggle: remindersEnabled,
          action: () => handleRemindersToggle(!remindersEnabled)
        },
        {
          id: "reminder-time",
          title: "Reminder Time",
          icon: "time" as const,
          extraText: reminderTime,
          action: () => {
            Alert.alert(
              "Select Reminder Time",
              "Choose when you want to receive reminders",
              reminderTimes.map(time => ({
                text: time,
                onPress: () => handleReminderTimeChange(time),
                style: reminderTime === time ? "default" : "cancel"
              }))
            );
          }
        },
      ],
    },
    {
      title: "Data & Security",
      options: [
        {
          id: "data-backup",
          title: "Cloud Backup",
          icon: "cloud" as const,
          action: handleDataBackup
        },
        {
          id: "export-data",
          title: "Export Data",
          icon: "download" as const,
          action: handleExportData
        },
        {
          id: "passcode-lock",
          title: "Passcode Lock",
          icon: "lock-closed" as const,
          toggle: passcodeEnabled,
          action: () => handlePasscodeToggle(!passcodeEnabled)
        },
        {
          id: "clear-data",
          title: "Clear All Data",
          icon: "trash" as const,
          action: handleClearData
        },
      ],
    },
    {
      title: "Help & Support",
      options: [
        { 
          id: "faqs", 
          title: "FAQs & Help", 
          icon: "help-circle" as const, 
          action: handleFAQs 
        },
        {
          id: "contact-support",
          title: "Contact Support",
          icon: "chatbubble" as const,
          action: handleContactSupport
        },
        {
          id: "rate-app",
          title: "Rate Our App",
          icon: "star" as const,
          action: handleRateApp
        },
      ],
    },
    {
      title: "About",
      options: [
        {
          id: "app-version",
          title: "App Version",
          icon: "information-circle" as const,
          extraText: `v${appVersion}`,
          action: () => {}
        },
        {
          id: "terms-of-service",
          title: "Terms of Service",
          icon: "document-text" as const,
          action: handleTermsOfService
        },
        {
          id: "privacy-policy",
          title: "Privacy Policy",
          icon: "shield" as const,
          action: handlePrivacyPolicy
        },
      ],
    },
  ];

  // Filter options based on search query
  const filteredSections = sections.map(section => ({
    ...section,
    options: section.options.filter(option =>
      option.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.options.length > 0);

  // Option component
  const SettingOption = memo(
    ({
      option,
      onPress,
    }: {
      option: SettingOption;
      onPress: (option: SettingOption) => void;
    }) => {
      return (
        <TouchableOpacity
          className={`flex-row justify-between items-center p-4 border-b active:bg-gray-50 ${borderClass}`}
          onPress={() => onPress(option)}
          accessibilityLabel={option.title}
          accessibilityRole="button"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-8 items-center">
              <Ionicons 
                name={option.icon} 
                size={20} 
                color={isDark ? "#9CA3AF" : "#4B5563"} 
              />
            </View>
            <Text className={`text-base ml-3 flex-1 ${textClass}`}>{option.title}</Text>
          </View>
          <View className="flex-row items-center">
            {option.extraText && (
              <Text className={`text-sm mr-3 ${textSecondaryClass}`}>{option.extraText}</Text>
            )}
            {option.toggle !== undefined ? (
              <Switch
                value={option.toggle}
                onValueChange={() => onPress(option)}
                trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                thumbColor={option.toggle ? "#FFFFFF" : "#FFFFFF"}
              />
            ) : (
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? "#9CA3AF" : "#9CA3AF"} 
              />
            )}
          </View>
        </TouchableOpacity>
      );
    }
  );

  const handleOptionPress = (option: SettingOption) => {
    if (option.action) {
      option.action();
    } else if (option.route) {
      router.push(option.route);
    }
  };

  const renderSection = ({ item }: { item: Section }) => (
    <View className="mb-4">
      <Text className={`text-xs font-medium uppercase px-4 py-2 ${textSecondaryClass}`}>
        {item.title}
      </Text>
      <View className={`rounded-lg overflow-hidden ${cardClass}`}>
        <FlatList
          data={item.options}
          keyExtractor={(option) => option.id}
          renderItem={({ item: option }) => (
            <SettingOption option={option} onPress={handleOptionPress} />
          )}
          scrollEnabled={false}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${backgroundClass}`}>
      <View className={`flex-1 ${backgroundClass}`}>
        <Stack.Screen 
          options={{ 
            title: "Settings",
            headerStyle: {
              backgroundColor: isDark ? "#0f102fff" : "#f9fafb",
            },
            headerTintColor: isDark ? "#FFFFFF" : "#000000",
            headerShadowVisible: false,
          }} 
        />
        
        {/* Header */}
        <View className={`px-6 py-6 border-b ${headerClass} ${borderClass}`}>
          <Text className={`text-3xl font-bold ${headerTextClass}`}>Settings</Text>
          <Text className={`mt-1 ${textSecondaryClass}`}>Customize your journal experience</Text>
        </View>

        {/* Search Bar */}
        <View className={`mx-4 my-4 rounded-xl border px-4 py-3 flex-row items-center shadow-sm ${inputClass}`}>
          <Ionicons name="search" size={20} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
          <TextInput
            className={`flex-1 py-0 text-base ml-3 ${textClass}`}
            placeholder="Search settings"
            placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search settings input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
            </TouchableOpacity>
          )}
        </View>

        {/* Settings List */}
        <FlatList
          data={filteredSections}
          keyExtractor={(section) => section.title}
          renderItem={renderSection}
          showsVerticalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-10">
              <Ionicons name="search" size={40} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
              <Text className={`mt-2 text-center ${textSecondaryClass}`}>No settings found for "{searchQuery}"</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;