import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const STORAGE_KEY_PREFIX = 'steps_';
export const BACKGROUND_STEP_TASK = 'BACKGROUND_STEP_TASK';

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

// Define Background Task
TaskManager.defineTask(BACKGROUND_STEP_TASK, async () => {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // You can't actively watch in background via Pedometer without a foreground service in standard React Native.
    // However, if the device hardware supports step counting natively, we can fetch steps for 'today'
    // by asking Pedometer for steps between start of day and now.
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    
    // Attempt to get historical steps for today
    // Note: This requires specific permissions on iOS/Android to read historical data
    const result = await Pedometer.getStepCountAsync(start, end);
    
    if (result && result.steps) {
        const today = new Date();
        const storedSteps = await getStoredSteps(today);
        
        // If background fetched steps are higher than what we have, update it.
        // Or we can just overwrite it since it's the total from the device for today.
        if (result.steps > storedSteps) {
            await saveSteps(today, result.steps);
            return BackgroundFetch.BackgroundFetchResult.NewData;
        }
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error("Background Fetch Error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register Background Task
export const registerBackgroundFetchAsync = async () => {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_STEP_TASK, {
    minimumInterval: 15 * 60, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
};

// Unregister Background Task
export const unregisterBackgroundFetchAsync = async () => {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_STEP_TASK);
};
