import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';

const STORAGE_KEY_PREFIX = 'steps_';

export interface DailySteps {
  date: string; // YYYY-MM-DD
  steps: number;
  goal: number;
}

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get steps for a specific date from storage
export const getStoredSteps = async (date: Date): Promise<number> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${formatDate(date)}`;
    const stored = await AsyncStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  } catch (error) {
    console.error('Error reading steps from storage:', error);
    return 0;
  }
};

// Save steps for a specific date
export const saveSteps = async (date: Date, steps: number): Promise<void> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${formatDate(date)}`;
    await AsyncStorage.setItem(key, steps.toString());
  } catch (error) {
    console.error('Error saving steps to storage:', error);
  }
};

// Check if Pedometer is available
export const isPedometerAvailable = async (): Promise<boolean> => {
  return await Pedometer.isAvailableAsync();
};

// Get steps for the last 7 days
export const getLast7DaysSteps = async (): Promise<DailySteps[]> => {
  const days: DailySteps[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const steps = await getStoredSteps(date);
    days.push({
      date: formatDate(date),
      steps,
      goal: 10000, // Default goal
    });
  }
  return days;
};

// Get steps for a specific month
export const getMonthSteps = async (year: number, month: number): Promise<DailySteps[]> => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: DailySteps[] = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const steps = await getStoredSteps(date);
    days.push({
      date: formatDate(date),
      steps,
      goal: 10000,
    });
  }
  return days;
};
