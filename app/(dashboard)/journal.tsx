import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  Animated,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  DateTimePickerAndroid,
  DateTimePicker,
} from "@react-native-community/datetimepicker";
import { ChevronRight } from "react-native-feather";
import { JournalEntry } from "../../types/JournalEntry";
import { Mood, defaultMoods } from "../../types/Mood";
import { createJournal } from "@/services/journalService";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { auth, db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { useThemeColors } from "@/hooks/useThemeColors";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface JournalScreenProps {
  setCurrentScreen?: (screen: string) => void;
  moods?: Mood[];
}

const JournalScreen: React.FC<JournalScreenProps> = ({
  setCurrentScreen,
  moods = [],
}) => {
  const { prompt } = useLocalSearchParams();
  const [promptReceived, setPromptReceived] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [showReminder, setShowReminder] = useState(false);
  const moodsToDisplay = moods.length > 0 ? moods : defaultMoods;

  // Use theme colors
  const {
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
    moodButtonClass,
    moodButtonTextClass,
  } = useThemeColors();

  const [isModalVisible, setModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState<JournalEntry>({
    id: "",
    title: "",
    content: "",
    date: new Date().toLocaleDateString("en-CA"),
    mood: "",
  });
  const [tempEntries, setTempEntries] = useState<JournalEntry[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const animatedValues = useRef(
    moodsToDisplay.map(() => new Animated.Value(1))
  ).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const moodColorMap = {
    amazing: "#22c55e",
    good: "#3b82f6",
    okay: "#eab308",
    notGreat: "#f97316",
    awful: "#ef4444",
  };

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("Notification permissions:", status);
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in settings to receive journal reminders.",
          [{ text: "OK", onPress: () => closeModal() }] // Close modal on permission denial
        );
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    const hasEntry = journalEntries.some((entry) => entry.date === today);
    setShowReminder(!hasEntry);
    console.log("Has entry for today:", hasEntry, "Show reminder:", !hasEntry);
  }, [journalEntries]);

  const scheduleNotification = useCallback(async () => {
    try {
      const today = new Date().toLocaleDateString("en-CA");
      const hasEntry = journalEntries.some((entry) => entry.date === today);

      console.log("Scheduling notification - Has entry for today:", hasEntry);

      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("Cancelled all previous notifications");

      if (hasEntry) {
        console.log("Journal entry exists for today, no notification needed");
        return;
      }

      // Set notification for 11:59 PM today
      const notificationTime = new Date();
      notificationTime.setHours(23, 59, 0, 0);

      console.log("Notification scheduled for:", notificationTime);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Journal Reminder",
          body: "Don't forget to add your journal entry for today!",
          sound: "default",
        },
        trigger: { date: notificationTime },
      });
      console.log("Notification scheduled successfully");
    } catch (error) {
      console.error("Notification scheduling error:", error);
      Alert.alert(
        "Error",
        "Failed to schedule notification.",
        [{ text: "OK", onPress: () => closeModal() }] // Close modal on error
      );
    }
  }, [journalEntries]);

  useEffect(() => {
    console.log("Current User:", auth.currentUser?.uid);
    if (!auth.currentUser) {
      console.log("User not logged in");
      Alert.alert(
        "Authentication Required",
        "Please log in to view your journal entries.",
        [{ text: "OK", onPress: () => closeModal() }] // Close modal on auth error
      );
      return;
    }

    console.log("Fetching journal entries from Firestore...");
    const unsubscribe = onSnapshot(
      collection(db, "journal"),
      (querySnapshot) => {
        const allJournals = querySnapshot.docs
          .filter((doc) => doc.data().userId === auth.currentUser?.uid)
          .map((doc) => ({ ...doc.data(), id: doc.id }) as JournalEntry);
        console.log("Fetched journal entries:", allJournals);
        setJournalEntries(allJournals);
        setTempEntries(allJournals);

        // Update showReminder based on today's entry
        const today = new Date().toLocaleDateString("en-CA");
        const hasEntry = allJournals.some((entry) => entry.date === today);
        setShowReminder(!hasEntry);
      },
      (error) => {
        console.error("Firestore error:", error);
        Alert.alert(
          "Connection Error",
          "Failed to fetch journal entries. Please check your connection and try again.",
          [{ text: "OK", onPress: () => closeModal() }] // Close modal on connection error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, scheduling notification...");
      scheduleNotification();
      setPromptReceived(false);
    }, [scheduleNotification])
  );

  useEffect(() => {
    if (prompt && isFirstTime) {
      console.log("Prompt received, opening modal:", prompt);
      setNewEntry({
        id: "",
        title: "Daily Reflection",
        content: `Prompt: ${prompt}\n\n`,
        date: new Date().toLocaleDateString("en-CA"),
        mood: "",
      });
      setModalVisible(true);
      animateModal(true);
      setIsFirstTime(false);

      Alert.alert(
        "Daily Prompt",
        "You've received a new journal prompt!",
        [{ text: "Start Writing", onPress: () => {} }] // Keep modal open for prompt
      );
    }
  }, [prompt, isFirstTime]);

  const animateMoodButton = (index: number) => {
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateModal = (visible: boolean) => {
    Animated.timing(modalOpacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showDatePickerAndroid = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: "date",
      display: "default",
      onChange: (event, selectedDate) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) {
          setDate(selectedDate);
          setNewEntry({
            ...newEntry,
            date: selectedDate.toLocaleDateString("en-CA"),
          });
        }
      },
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
      setNewEntry({
        ...newEntry,
        date: selectedDate.toLocaleDateString("en-CA"),
      });
    }
  };

  const handleSubmit = async () => {
    if (!newEntry.title || !newEntry.content || !newEntry.mood) {
      Alert.alert(
        "Incomplete Entry",
        "Please fill in all fields: title, content, and select a mood.",
        [{ text: "OK", onPress: () => {} }] // Keep modal open to continue editing
      );
      return;
    }

    console.log("Submitting new journal entry:", newEntry);
    try {
      const newId = (tempEntries.length + 1).toString();
      await createJournal({ ...newEntry, userId: auth.currentUser?.uid });
      setTempEntries([{ ...newEntry, id: newId }, ...tempEntries]);

      Alert.alert(
        "Success!",
        "Your journal entry has been saved successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              closeModal();
              const today = new Date().toLocaleDateString("en-CA");
              if (newEntry.date === today) {
                setShowReminder(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error saving journal entry:", error);
      Alert.alert(
        "Save Failed",
        "There was an error saving your journal entry. Please try again.",
        [{ text: "OK", onPress: () => closeModal() }] // Close modal on save error
      );
    }
  };

  const openModal = () => {
    console.log("Opening modal for new journal entry");
    setNewEntry({
      id: "",
      title: "",
      content: "",
      date: new Date().toLocaleDateString("en-CA"),
      mood: "",
    });
    setDate(new Date());
    setModalVisible(true);
    animateModal(true);
    setIsFirstTime(false);
  };

  const closeModal = () => {
    if (newEntry.title || newEntry.content || newEntry.mood) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Cancel", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              console.log("Closing modal and discarding changes");
              setModalVisible(false);
              animateModal(false);
              setNewEntry({
                id: "",
                title: "",
                content: "",
                date: new Date().toLocaleDateString("en-CA"),
                mood: "",
              });
              setDate(new Date());
            },
          },
        ]
      );
    } else {
      console.log("Closing modal");
      setModalVisible(false);
      animateModal(false);
      setNewEntry({
        id: "",
        title: "",
        content: "",
        date: new Date().toLocaleDateString("en-CA"),
        mood: "",
      });
      setDate(new Date());
    }
  };

  const handleViewEntry = (entry: JournalEntry) => {
    if (setCurrentScreen) {
      setCurrentScreen(`journal/${entry.id}`);
    } else {
      Alert.alert(
        "Entry Details",
        `Title: ${entry.title}\nDate: ${entry.date}\nMood: ${
          moodsToDisplay.find((m) => m.value === entry.mood)?.label || "Unknown"
        }\n\nContent: ${entry.content.substring(0, 200)}${
          entry.content.length > 200 ? "..." : ""
        }`,
        [{ text: "OK", onPress: () => closeModal() }] // Close modal when viewing entry details
      );
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${backgroundClass}`}>
      <View className={`flex-1 ${backgroundClass}`}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <Animated.View
            className="flex-1 justify-center items-center bg-black/50"
            style={{ opacity: modalOpacity }}
          >
            <View className={`rounded-2xl p-6 w-11/12 max-w-md ${modalClass}`}>
              <Text className={`text-xl font-bold mb-4 ${modalTextClass}`}>
                New Journal Entry
              </Text>
              <TextInput
                className={`border rounded-lg p-3 mb-4 ${inputClass}`}
                placeholder="Title"
                placeholderTextColor={
                  textSecondaryClass.includes("text-gray-300")
                    ? "#D1D5DB"
                    : "#6B7280"
                }
                value={newEntry.title}
                onChangeText={(text) => setNewEntry({ ...newEntry, title: text })}
                accessibilityLabel="Enter journal entry title"
              />
              <TextInput
                className={`border rounded-lg p-3 mb-4 h-32 ${inputClass}`}
                placeholder="Write your thoughts..."
                placeholderTextColor={
                  textSecondaryClass.includes("text-gray-300")
                    ? "#D1D5DB"
                    : "#6B7280"
                }
                value={newEntry.content}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, content: text })
                }
                multiline
                accessibilityLabel="Enter journal entry content"
              />
              <TouchableOpacity
                className={`border rounded-lg p-3 mb-4 ${inputClass}`}
                onPress={() => {
                  if (Platform.OS === "android") {
                    showDatePickerAndroid();
                  } else {
                    setShowDatePicker(true);
                  }
                }}
                accessibilityLabel="Select journal entry date"
                accessibilityRole="button"
              >
                <Text className={`text-sm ${textSecondaryClass}`}>
                  Date: {newEntry.date}
                </Text>
              </TouchableOpacity>
              {Platform.OS !== "android" && showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
              <Text className={`text-sm font-semibold mb-2 ${modalTextClass}`}>
                Select Mood
              </Text>
              <View className="flex-row flex-wrap justify-between mb-4">
                {moodsToDisplay.map((mood, index) => (
                  <Animated.View
                    key={mood.value}
                    style={{ transform: [{ scale: animatedValues[index] }] }}
                  >
                    <TouchableOpacity
                      className={`flex-col items-center justify-center w-20 h-20 rounded-xl p-2 mb-2 ${
                        newEntry.mood === mood.value
                          ? "border border-gray-200"
                          : "border border-gray-200"
                      } ${moodButtonClass}`}
                      style={
                        newEntry.mood === mood.value
                          ? { backgroundColor: moodColorMap[mood.value] }
                          : {}
                      }
                      onPress={() => {
                        setNewEntry({ ...newEntry, mood: mood.value });
                        animateMoodButton(index);
                      }}
                      accessibilityLabel={`Select ${mood.label} mood`}
                      accessibilityRole="button"
                    >
                      <Text className="text-2xl mb-1">{mood.emoji}</Text>
                      <Text
                        className={`text-xs font-medium ${
                          newEntry.mood === mood.value
                            ? "text-white"
                            : moodButtonTextClass
                        }`}
                      >
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              <View className="flex-row justify-end" style={{ gap: 8 }}>
                <TouchableOpacity
                  className="bg-gray-200 py-2 px-4 rounded-full"
                  onPress={closeModal}
                  accessibilityLabel="Cancel new journal entry"
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium text-gray-800">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-2 px-4 rounded-full ${
                    !newEntry.title || !newEntry.content || !newEntry.mood
                      ? "bg-gray-400"
                      : "bg-purple-600"
                  }`}
                  onPress={handleSubmit}
                  disabled={
                    !newEntry.title || !newEntry.content || !newEntry.mood
                  }
                  accessibilityLabel="Save new journal entry"
                  accessibilityRole="button"
                >
                  <Text
                    className={`text-sm font-medium ${
                      !newEntry.title || !newEntry.content || !newEntry.mood
                        ? "text-gray-600"
                        : "text-white"
                    }`}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Modal>
        <View
          className={`flex-row justify-between items-center px-4 py-4 border-b ${headerClass} ${borderClass}`}
        >
          <Text className={`text-xl font-semibold ${headerTextClass}`}>
            Journal
          </Text>
        </View>
        <ScrollView className="p-4">
          {showReminder && (
            <View className="bg-yellow-100 p-4 rounded-lg mb-4">
              <Text className="text-sm font-medium text-yellow-800">
                You haven't added a journal entry for today yet!
              </Text>
              <TouchableOpacity
                className="bg-yellow-600 py-2 px-4 rounded-full mt-2"
                onPress={openModal}
                accessibilityLabel="Add journal entry now"
                accessibilityRole="button"
              >
                <Text className="text-sm font-medium text-white text-center">
                  Add Now
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            className={`py-3 rounded-lg mb-4 ${buttonClass}`}
            onPress={openModal}
            accessibilityLabel="Add new journal entry"
            accessibilityRole="button"
          >
            <Text
              className={`text-base font-medium text-center ${buttonTextClass}`}
            >
              + New Journal Entry
            </Text>
          </TouchableOpacity>
          {tempEntries.length === 0 ? (
            <View className="p-6 rounded-xl border mb-3 bg-gray-50 border-gray-200">
              <Text className="text-center text-gray-500">
                No journal entries yet. Start by adding your first entry!
              </Text>
            </View>
          ) : (
            tempEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                className={`p-4 rounded-xl border mb-3 ${cardClass} ${borderClass}`}
                onPress={() => handleViewEntry(entry)}
                accessibilityLabel={`View journal entry: ${entry.title}`}
                accessibilityRole="button"
              >
                <View className="flex-row justify-between mb-2">
                  <Text className={`text-sm font-medium ${textClass}`}>
                    {entry.title}
                  </Text>
                  <Text className={`text-xs ${textSecondaryClass}`}>
                    {entry.date}
                  </Text>
                </View>
                <Text
                  className={`text-xs mb-2 ${textSecondaryClass}`}
                  numberOfLines={2}
                >
                  {entry.content}
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className={`text-xs ${textSecondaryClass}`}>
                    {moodsToDisplay.find((m) => m.value === entry.mood)?.emoji}{" "}
                    {moodsToDisplay.find((m) => m.value === entry.mood)?.label ||
                      "Unknown Mood"}
                  </Text>
                  <ChevronRight
                    size={14}
                    color={
                      textSecondaryClass.includes("text-gray-300")
                        ? "#D1D5DB"
                        : "#9CA3AF"
                    }
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default JournalScreen;