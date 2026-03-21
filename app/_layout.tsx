import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, useFonts } from '@expo-google-fonts/inter';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AchievementToast from './components/AchievementToast';

// Splash screen'in otomatik kapanmasını engelle (Fontlar yüklenene kadar)
SplashScreen.preventAutoHideAsync();

// Configure expo-notifications to show alerts while in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const router = useRouter();
  
  // Fontları yükle
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Setup Firebase Cloud Messaging (FCM)
  useEffect(() => {
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };

    requestUserPermission();

    // Foreground messages handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.notification) {
        // Trigger local notification for foreground state
        Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || 'New Message',
            body: remoteMessage.notification.body,
            data: remoteMessage.data,
          },
          trigger: null, // show immediately
        });
      }
    });

    return unsubscribe;
  }, []);

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !initializing) {
      SplashScreen.hideAsync();
      // Hide navigation bar
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, [loaded, initializing]);

  if (!loaded || initializing) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        {/* 'login' ve 'register' app/ dizininde olduğu için name="login" olmalı */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="screens/OnboardingScreen" />
        <Stack.Screen name="screens/GoalSelectionScreen" />
        <Stack.Screen name="screens/LocationSelectionScreen" />
        <Stack.Screen name="screens/FrequencySelectionScreen" />
        <Stack.Screen name="screens/LevelSelectionScreen" />
        <Stack.Screen name="screens/PersonalDataScreen" />
        <Stack.Screen name="screens/CreateProgramScreen" />
        <Stack.Screen name="screens/WorkoutDetailsScreen" />
        <Stack.Screen name="screens/ExerciseDetailScreen" />
        <Stack.Screen name="screens/AddStepsScreen" />
        <Stack.Screen name="screens/LogWaterScreen" />
        <Stack.Screen name="screens/AddMealScreen" />
        <Stack.Screen name="screens/AddCustomMealScreen" />
        <Stack.Screen name="screens/LogWeightScreen" />
        <Stack.Screen name="screens/BodyFatCalculatorScreen" />
        <Stack.Screen name="screens/MeasurementGuideScreen" />
        <Stack.Screen name="screens/MealDetailsScreen" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <AchievementToast />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
