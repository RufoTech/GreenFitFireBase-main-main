import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AppEvents } from './eventEmitter';

const ACHIEVEMENTS_STORAGE_KEY = 'user_achievements';
const USER_XP_KEY = 'user_xp';
const WORKOUT_DAYS_KEY = 'workout_days_history';

export type AchievementId = 
  | 'early_bird' 
  | 'flexibility_guru' 
  | '7_day_streak' 
  | 'first_10k' 
  | 'marathon_runner' 
  | 'muscle_master' 
  | 'hydration_hero';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  early_bird: { id: 'early_bird', title: 'Early Bird', description: 'Joined the app!', xpReward: 50, icon: 'wb-sunny' },
  flexibility_guru: { id: 'flexibility_guru', title: 'Flexibility Guru', description: 'Used the app for 7 days', xpReward: 100, icon: 'self-improvement' },
  '7_day_streak': { id: '7_day_streak', title: '7-Day Streak', description: 'Met step goal 7 days in a row', xpReward: 200, icon: 'local-fire-department' },
  first_10k: { id: 'first_10k', title: 'First 10k Steps', description: 'Walked 10,000 steps in a single day', xpReward: 150, icon: 'directions-walk' },
  marathon_runner: { id: 'marathon_runner', title: 'Marathon Runner', description: 'Walked 100,000 total steps', xpReward: 500, icon: 'directions-run' },
  muscle_master: { id: 'muscle_master', title: 'Muscle Master', description: 'Completed workouts on 7 different days', xpReward: 300, icon: 'fitness-center' },
  hydration_hero: { id: 'hydration_hero', title: 'Hydration Hero', description: 'Met daily water limit', xpReward: 100, icon: 'water-drop' },
};

// --- Helpers to Get/Set Local Data ---

export const getUnlockedAchievements = async (): Promise<Record<string, { id: string, unlockedAt: number }>> => {
  try {
    const data = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading achievements', error);
    return {};
  }
};

export const getUserXp = async (): Promise<number> => {
  try {
    const xpStr = await AsyncStorage.getItem(USER_XP_KEY);
    return xpStr ? parseInt(xpStr, 10) : 0;
  } catch (error) {
    return 0;
  }
};

const saveUserXp = async (xp: number) => {
  try {
    await AsyncStorage.setItem(USER_XP_KEY, xp.toString());
  } catch (error) {
    console.error('Error saving XP', error);
  }
};

// --- Unlock Logic ---

const unlockAchievement = async (achievementId: AchievementId) => {
  try {
    console.log(`[Achievements Local] Checking unlock for: ${achievementId}`);
    const unlocked = await getUnlockedAchievements();

    if (unlocked[achievementId]) {
      console.log(`[Achievements Local] ${achievementId} is already unlocked.`);
      return false; // Already unlocked
    }

    const achievement = ACHIEVEMENTS[achievementId];
    console.log(`[Achievements Local] Unlocking ${achievementId}...`);
    
    // Save achievement
    unlocked[achievementId] = {
      id: achievementId,
      unlockedAt: Date.now()
    };
    await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlocked));
    
    // Update XP
    const currentXp = await getUserXp();
    await saveUserXp(currentXp + achievement.xpReward);

    console.log(`[Achievements Local] Successfully unlocked ${achievementId}!`);

    // Emit event for in-app toast
    AppEvents.emit('ACHIEVEMENT_UNLOCKED', achievement);
    // Emit general update event so screen can re-render
    AppEvents.emit('ACHIEVEMENTS_UPDATED');

    // Send local push notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Achievement Unlocked: ${achievement.title} 🏆`,
          body: `You earned ${achievement.xpReward} XP!`,
          sound: true,
        },
        trigger: null,
      });
    } catch (notifErr) {
      console.log(`[Achievements Local] Notification error:`, notifErr);
    }

    return true;
  } catch (error) {
    console.error(`[Achievements Local] Error unlocking ${achievementId}:`, error);
    return false;
  }
};

// --- Check Functions ---

export const checkEarlyBird = async () => {
  await unlockAchievement('early_bird');
};

export const checkFlexibilityGuru = async (installDateTimestamp: number) => {
  const now = Date.now();
  const diffTime = Math.abs(now - installDateTimestamp);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  if (diffDays >= 7) {
    await unlockAchievement('flexibility_guru');
  }
};

export const checkStepAchievements = async (totalStepsToday: number, allTimeSteps: number, streakDays: number) => {
  if (totalStepsToday >= 10000) {
    await unlockAchievement('first_10k');
  }
  if (allTimeSteps >= 100000) {
    await unlockAchievement('marathon_runner');
  }
  if (streakDays >= 7) {
    await unlockAchievement('7_day_streak');
  }
};

export const checkHydrationHero = async (totalWaterToday: number, dailyGoal: number) => {
  if (totalWaterToday >= dailyGoal && dailyGoal > 0) {
    await unlockAchievement('hydration_hero');
  }
};

export const checkMuscleMaster = async () => {
  try {
    const historyStr = await AsyncStorage.getItem(WORKOUT_DAYS_KEY);
    const history: string[] = historyStr ? JSON.parse(historyStr) : [];
    
    // Add today's date if not exists
    const todayStr = new Date().toISOString().split('T')[0];
    if (!history.includes(todayStr)) {
      history.push(todayStr);
      await AsyncStorage.setItem(WORKOUT_DAYS_KEY, JSON.stringify(history));
    }

    if (history.length >= 7) {
      await unlockAchievement('muscle_master');
    }
  } catch (e) {
    console.error("Error in checkMuscleMaster", e);
  }
};
