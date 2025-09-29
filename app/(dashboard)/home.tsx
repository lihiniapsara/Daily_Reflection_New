import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  Modal,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { JournalEntry } from "@/types/JournalEntry";
import { Goal } from "@/types/Goal";
import { auth, db } from "@/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useThemeColors } from "@/hooks/useThemeColors";

// Mood options with enhanced data
const moodOptions: {
  label: string;
  value: number;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}[] = [
  { 
    label: "Amazing", 
    value: 5, 
    emoji: "😊", 
    color: "#10B981", 
    bgColor: "bg-green-100",
    description: "Feeling fantastic and energetic" 
  },
  { 
    label: "Good", 
    value: 4, 
    emoji: "🙂", 
    color: "#3B82F6", 
    bgColor: "bg-blue-100",
    description: "Having a positive day" 
  },
  { 
    label: "Okay", 
    value: 3, 
    emoji: "😐", 
    color: "#F59E0B", 
    bgColor: "bg-yellow-100",
    description: "Neutral, not bad but not great" 
  },
  { 
    label: "Not Great", 
    value: 2, 
    emoji: "😞", 
    color: "#F97316", 
    bgColor: "bg-orange-100",
    description: "Things could be better" 
  },
  { 
    label: "Awful", 
    value: 1, 
    emoji: "😢", 
    color: "#EF4444", 
    bgColor: "bg-red-100",
    description: "Having a really tough time" 
  },
];

// Journal item component
const JournalEntryItem: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
  const router = useRouter();
  const colors = useThemeColors(); // Add this
  
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between p-4 ${colors.card} border ${colors.border} rounded-lg mb-3 shadow-sm`}
      onPress={() => router.push(`/journal/${entry.id}`)}
      accessibilityLabel={`View journal entry: ${entry.title}`}
      accessibilityRole="button"
    >
      <View className="flex-1 mr-3">
        <Text className={`text-base font-medium ${colors.text}`} numberOfLines={1}>
          {entry.title}
        </Text>
        <Text className={`text-sm ${colors.textSecondary} mt-1`}>
          {entry.date} • {entry.mood}
        </Text>
        <Text className={`text-sm ${colors.textSecondary} mt-1`} numberOfLines={2}>
          {entry.content}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.isDark ? "#9CA3AF" : "#9CA3AF"} />
    </TouchableOpacity>
  );
};

// Goal item component
const GoalItem: React.FC<{ goal: Goal }> = ({ goal }) => {
  const colors = useThemeColors(); // Add this
  const progressPercentage = goal.progress ? (goal.progress / goal.target) * 100 : 0;
  
  return (
    <View className="flex-row items-center mb-3">
      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
        <Ionicons name="trophy-outline" size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${colors.text}`}>
          {goal.title}
        </Text>
        <Text className={`text-sm ${colors.textSecondary}`}>
          {goal.progress || 0}/{goal.target} {goal.unit || "completed"}
        </Text>
      </View>
      <View className="bg-blue-100 px-2 py-1 rounded-full">
        <Text className="text-xs font-medium text-blue-800">
          {Math.min(100, Math.round(progressPercentage))}%
        </Text>
      </View>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodDescription, setMoodDescription] = useState("");
  const [selectedMoodData, setSelectedMoodData] = useState<{label: string; emoji: string} | null>(null);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const scaleAnim = new Animated.Value(0);
  const colors = useThemeColors(); // Add this

  // Calculate mood item width based on screen size
  const moodItemWidth = width < 400 ? (width - 48) / 3.5 : 100;
  const moodItemHeight = width < 400 ? 90 : 100;

  // Fetch journal entries from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "journal"),
      (querySnapshot) => {
        const allJournals = querySnapshot.docs
          .filter((doc) => doc.data().userId === auth.currentUser?.uid)
          .map(
            (doc) =>
              ({
                ...doc.data(),
                id: doc.id,
              }) as JournalEntry
          );
        setJournal(allJournals);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch goals from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "goal"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allGoals: Goal[] = [];
      querySnapshot.forEach((doc) => {
        allGoals.push({
          id: doc.id,
          ...doc.data(),
        } as Goal);
      });
      setGoals(allGoals);
      setLoadingGoals(false);
    }, (error) => {
      console.error("Error fetching goals:", error);
      setLoadingGoals(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMoodSelection = (moodValue: number) => {
    setSelectedMood(moodValue);
    
    // Find the selected mood description
    const selected = moodOptions.find(mood => mood.value === moodValue);
    if (selected) {
      setMoodDescription(selected.description);
      setSelectedMoodData({
        label: selected.label,
        emoji: selected.emoji
      });
    }
    
    // Show the modal only if the mood is negative (value 1 or 2)
    if (moodValue <= 2) {
      setShowMoodModal(true);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();
    }
  };

  const closeMoodModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowMoodModal(false);
    });
  };

  const confirmMoodSelection = () => {
    if (selectedMoodData) {
      // Navigate to journal creation with mood data
      router.push({
        pathname: "/journal",
        params: { 
          mood: selectedMoodData.label,
          moodEmoji: selectedMoodData.emoji,
          prompt: `How did your ${selectedMoodData.label.toLowerCase()} day make you feel?`
        }
      });
    }
    closeMoodModal();
  };

  const handleJournalNow = () => {
    if (selectedMoodData) {
      // Navigate directly to journal creation
      router.push({
        pathname: "/journal",
        params: { 
          mood: selectedMoodData.label,
          moodEmoji: selectedMoodData.emoji,
          prompt: `How did your ${selectedMoodData.label.toLowerCase()} day make you feel?`
        }
      });
    }
  };

  const getMoodEmoji = () => {
    const selected = moodOptions.find(mood => mood.value === selectedMood);
    return selected ? selected.emoji : "";
  };

  const getMoodColor = () => {
    const selected = moodOptions.find(mood => mood.value === selectedMood);
    return selected ? selected.color : "#6B7280";
  };

  return (
    <SafeAreaView className={`flex-1 ${colors.background}`}>
      <Stack.Screen options={{ 
        title: "Home", 
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.isDark ? '#1f2937' : '#f9fafb',
        },
        headerTintColor: colors.isDark ? '#f3f4f6' : '#111827',
      }} />

      {/* Header */}
      <View className={`flex-row items-center justify-between ${colors.card} px-5 py-4 border-b ${colors.border}`}>
        <View className="flex-1">
          <Text className={`text-xl font-bold ${colors.text}`}>
            Daily Reflection
          </Text>
          <Text className={`text-sm ${colors.textSecondary} mt-1`}>
            Today, {new Date().toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/setting")}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          className="p-2"
        >
          <Ionicons name="settings-outline" size={24} color={colors.isDark ? "#D1D5DB" : "#4B5563"} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        className="flex-1"
      >
        {/* Mood Selection */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-bold ${colors.text}`}>
              How are you feeling today?
            </Text>
            {selectedMood && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedMood(null);
                  setSelectedMoodData(null);
                }}
                className="px-3 py-1 bg-gray-100 rounded-full"
              >
                <Text className="text-xs text-gray-600">Change</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {selectedMood ? (
            <View className={`p-4 rounded-xl mb-3 flex-row items-center justify-between`}
              style={{ backgroundColor: `${getMoodColor()}20` }} // 20 is for 12% opacity
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: getMoodColor() }}
                >
                  <Text className="text-2xl">{getMoodEmoji()}</Text>
                </View>
                <View>
                  <Text className={`text-lg font-semibold ${colors.text}`}>
                    {moodOptions.find(m => m.value === selectedMood)?.label}
                  </Text>
                  <Text className={`text-sm ${colors.textSecondary}`}>
                    {moodDescription}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleJournalNow}
                className="bg-purple-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Journal Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={{
                    width: moodItemWidth,
                    height: moodItemHeight,
                    marginHorizontal: 6,
                  }}
                  className={`flex-col items-center justify-center rounded-xl p-3
                    ${mood.bgColor} border ${colors.border}`}
                  onPress={() => handleMoodSelection(mood.value)}
                  accessibilityLabel={`Select ${mood.label} mood`}
                  accessibilityRole="button"
                >
                  <Text className="text-3xl mb-1">{mood.emoji}</Text>
                  <Text
                    className="text-xs font-semibold text-center text-gray-800"
                    numberOfLines={1}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Monthly Goals */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-semibold ${colors.text}`}>
              Monthly Goals
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/goal")}
              accessibilityLabel="View all goals"
              accessibilityRole="button"
            >
              <Text className="text-purple-600 text-sm font-medium">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View className={`p-4 ${colors.card} border ${colors.border} rounded-lg shadow-sm`}>
            {loadingGoals ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : goals.length > 0 ? (
              <>
                {goals.slice(0, 2).map((goal) => (
                  <React.Fragment key={goal.id}>
                    <GoalItem goal={goal} />
                    <View className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <View
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (goal.progress || 0) / goal.target * 100)}%` }}
                      ></View>
                    </View>
                  </React.Fragment>
                ))}
              </>
            ) : (
              <Text className={`${colors.textSecondary} text-center py-3`}>
                No goals set yet. Add your first goal to track progress.
              </Text>
            )}

            <TouchableOpacity
              className="flex-row items-center justify-center mt-4 pt-3 border-t border-gray-100"
              onPress={() => router.push("/goal")}
              accessibilityLabel="Add new goal"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={18} color="#7C3AED" />
              <Text className="text-purple-600 text-sm font-medium ml-1">
                {goals.length > 0 ? "Add New Goal" : "Create Your First Goal"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Prompt */}
        <View className="mb-6">
          <Text className={`text-lg font-semibold ${colors.text} mb-4`}>
            Daily Prompt
          </Text>
          <View className={`p-5 ${colors.card} border ${colors.border} rounded-lg shadow-sm`}>
            <Text className={`text-base ${colors.textSecondary} italic mb-4`}>
              "What is one thing you're grateful for today?"
            </Text>
            <TouchableOpacity
              className="w-full bg-purple-600 py-3 rounded-lg"
              onPress={() => {
                // Navigate to journal tab with prompt parameter
                router.push({
                  pathname: "/journal",
                  params: { prompt: "What is one thing you're grateful for today?" }
                });
              }}
              accessibilityLabel="Write about daily prompt"
              accessibilityRole="button"
            >
              <Text className="text-base font-medium text-white text-center">
                Write about it
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Journal Entries */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-semibold ${colors.text}`}>
              Recent Entries
            </Text>
            {journal.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/journal")}
                accessibilityLabel="View all journal entries"
                accessibilityRole="button"
              >
                <Text className="text-purple-600 text-sm font-medium">
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {journal.length > 0 ? (
            <>
              {journal.slice(0, 3).map((entry) => (
                <JournalEntryItem key={entry.id} entry={entry} />
              ))}
            </>
          ) : (
            <View className={`p-5 ${colors.card} border ${colors.border} rounded-lg shadow-sm`}>
              <Text className={`text-base ${colors.textSecondary} text-center mb-4`}>
                No journal entries yet. Start by writing your first entry!
              </Text>
              <TouchableOpacity
                className="w-full bg-purple-600 py-3 rounded-lg"
                onPress={() => router.push("/journal")}
              >
                <Text className="text-base font-medium text-white text-center">
                  Start Journaling
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Mood Selection Modal - Only shown for negative moods */}
      <Modal
        visible={showMoodModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMoodModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-5">
          <Animated.View 
            style={{ 
              transform: [{ scale: scaleAnim }],
            }}
            className={`w-full max-w-md ${colors.card} rounded-xl p-6`}
          >
            <View className="items-center mb-5">
              <View className="w-20 h-20 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: getMoodColor() }}
              >
                <Text className="text-4xl">{getMoodEmoji()}</Text>
              </View>
              <Text className={`text-2xl font-bold ${colors.text} mb-1`}>
                {moodOptions.find(m => m.value === selectedMood)?.label}
              </Text>
              <Text className={`${colors.textSecondary} text-center`}>
                {moodDescription}
              </Text>
            </View>
            
            <Text className={`${colors.textSecondary} mb-4 text-center`}>
              Would you like to journal about this feeling?
            </Text>
            
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={closeMoodModal}
                className="px-5 py-3 rounded-lg bg-gray-100 flex-1 mr-2"
              >
                <Text className="text-center font-medium text-gray-700">Not Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={confirmMoodSelection}
                className="px-5 py-3 rounded-lg bg-purple-600 flex-1 ml-2"
              >
                <Text className="text-center font-medium text-white">Journal Now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;