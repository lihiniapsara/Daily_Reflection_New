export interface Mood {
  emoji: string;
  label: string;
  value: string; // keep this as string to match mood keys
  color: string;
}

export interface WeeklyMoodData {
  day: string;
  value: number;
  mood: string;
}

export interface MoodDistribution {
  mood: string;
  percentage: number;
  color: string;
  count: number;
}

export const defaultMoods: Mood[] = [
  { label: "Amazing", value: "amazing", emoji: "😊", color: "bg-green-500" },
  { label: "Good", value: "good", emoji: "🙂", color: "bg-blue-500" },
  { label: "Okay", value: "okay", emoji: "😐", color: "bg-yellow-500" },
  { label: "Not Great", value: "not-great", emoji: "😞", color: "bg-orange-500" },
  { label: "Awful", value: "awful", emoji: "😢", color: "bg-red-500" },
];

export const defaultWeeklyMoodData: WeeklyMoodData[] = [
  { day: "Mon", value: 4.2, mood: "good" },
  { day: "Tue", value: 4.8, mood: "amazing" },
  { day: "Wed", value: 4.1, mood: "good" },
  { day: "Thu", value: 3.5, mood: "okay" },
  { day: "Fri", value: 2.8, mood: "not-great" },
  { day: "Sat", value: 4.9, mood: "amazing" },
  { day: "Sun", value: 4.3, mood: "good" },
];

export const defaultMoodDistribution: MoodDistribution[] = [
  { mood: "Amazing", percentage: 45, color: "#10B981", count: 18 },
  { mood: "Good", percentage: 30, color: "#3B82F6", count: 12 },
  { mood: "Okay", percentage: 15, color: "#F59E0B", count: 6 },
  { mood: "Not Great", percentage: 8, color: "#EF4444", count: 3 },
  { mood: "Awful", percentage: 2, color: "#7C2D12", count: 1 },
];
