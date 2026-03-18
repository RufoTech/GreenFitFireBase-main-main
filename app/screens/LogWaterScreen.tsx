import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, TextInput, ScrollView, Dimensions, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const PRIMARY = "#ccff00";
const BG_DARK = "#12140a"; // Updated from HTML
const CARD_BG = "rgba(255, 255, 255, 0.05)";
const TEXT_COLOR = "#f1f5f9";
const SUBTEXT = "#94a3b8";
const GOAL = 2500;
const { width } = Dimensions.get('window');

const initialHistory = [
  { id: 1, label: "Glass of water", time: "08:30 AM", amount: 250, icon: "water-outline" },
  { id: 2, label: "Sports Bottle", time: "11:15 AM", amount: 500, icon: "bottle-soda-classic-outline" },
  { id: 3, label: "Large Bottle", time: "02:45 PM", amount: 450, icon: "water-percent" },
];

export default function LogWaterScreen() {
  const [consumed, setConsumed] = useState(1200);
  const [customAmount, setCustomAmount] = useState("");
  const [history, setHistory] = useState(initialHistory);
  const [weekDays, setWeekDays] = useState<any[]>([]);
  const router = useRouter();

  // Calculate percentage for ring
  const percentage = Math.min(Math.round((consumed / GOAL) * 100), 100);
  const R = 115; // Radius from HTML size-64 (256px) -> ~115 radius accounting for stroke
  const CIRC = 2 * Math.PI * R;
  const strokeDashoffset = CIRC - (percentage / 100) * CIRC;

  useEffect(() => {
    // Generate current week days
    const days = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0-6 (Sun-Sat)
    
    // Adjust to start from Mon or just show current week centering today? 
    // HTML shows Mon-Sun. Let's generate Mon-Sun for current week.
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push({
            dayName: dayNames[i],
            dayNumber: d.getDate(),
            isToday: d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
        });
    }
    setWeekDays(days);
  }, []);

  const addWater = (amount: number, label: string, icon: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setConsumed((prev) => Math.min(prev + amount, GOAL * 2)); // Allow exceeding goal
    setHistory((prev) => [
      { id: Date.now(), label, time, amount, icon },
      ...prev,
    ]);
  };

  const deleteItem = (id: number, amount: number) => {
      setConsumed(prev => Math.max(0, prev - amount));
      setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleCustomAdd = () => {
    const val = parseInt(customAmount);
    if (val > 0) {
      addWater(val, `Custom amount`, "water-plus-outline");
      setCustomAmount("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
      
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Log Water</Text>
          <Text style={styles.headerSubtitle}>LOG YOUR WATER INTAKE</Text>
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="settings" size={24} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Week View Calendar */}
        <View style={styles.calendarContainer}>
            {weekDays.map((day, index) => (
                <View key={index} style={styles.dayColumn}>
                    <Text style={styles.dayName}>{day.dayName}</Text>
                    <View style={[
                        styles.dayCircle, 
                        day.isToday && styles.activeDayCircle
                    ]}>
                        <Text style={[
                            styles.dayNumber,
                            day.isToday && styles.activeDayNumber
                        ]}>{day.dayNumber}</Text>
                    </View>
                </View>
            ))}
        </View>

        {/* Central Visualization */}
        <View style={styles.progressSection}>
            <View style={styles.ringContainer}>
                <Svg width={256} height={256} viewBox="0 0 256 256" style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor={PRIMARY} stopOpacity="0.4" />
                            <Stop offset="1" stopColor={PRIMARY} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    {/* Background Circle */}
                    <Circle
                        cx="128"
                        cy="128"
                        r={R}
                        fill="transparent"
                        stroke="#363a27"
                        strokeWidth="24"
                    />
                    {/* Progress Circle */}
                    <Circle
                        cx="128"
                        cy="128"
                        r={R}
                        fill="transparent"
                        stroke={PRIMARY}
                        strokeWidth="24"
                        strokeDasharray={CIRC}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </Svg>
                
                {/* Inner Content */}
                <View style={styles.ringContent}>
                    <MaterialIcons name="water-drop" size={48} color={PRIMARY} style={{ marginBottom: 8 }} />
                    <View style={styles.valueContainer}>
                        <Text style={styles.consumedText}>{(consumed / 1000).toFixed(1)}</Text>
                        <Text style={styles.separatorText}>/</Text>
                        <Text style={styles.goalText}>{(GOAL / 1000).toFixed(1)}L</Text>
                    </View>
                    <Text style={styles.percentageText}>{percentage}% Completed</Text>
                </View>
            </View>

            <View style={styles.dailyGoalContainer}>
                <Text style={styles.dailyGoalTitle}>Daily Goal</Text>
                <Text style={styles.dailyGoalSubtitle}>Stay hydrated for better performance</Text>
            </View>
        </View>

        {/* Quick Add Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Add Water</Text>
                <View style={styles.quickLogBadge}>
                    <Text style={styles.quickLogText}>QUICK LOG</Text>
                </View>
            </View>

            <View style={styles.quickButtonsGrid}>
                {[
                    { amount: 250, icon: "water-outline", label: "+250ml" },
                    { amount: 500, icon: "bottle-soda-classic-outline", label: "+500ml" },
                    { amount: 750, icon: "water-percent", label: "+750ml" },
                ].map((item, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={styles.quickButton}
                        onPress={() => addWater(item.amount, "Quick Add", item.icon)}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name={item.icon as any} size={28} color={PRIMARY} style={{ marginBottom: 4 }} />
                        <Text style={styles.quickButtonText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Custom Input */}
            <View style={styles.customInputContainer}>
                <View style={styles.inputIconContainer}>
                    <MaterialIcons name="edit" size={20} color={customAmount ? PRIMARY : SUBTEXT} />
                </View>
                <TextInput
                    style={styles.input}
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    placeholder="Custom amount (ml)"
                    placeholderTextColor={SUBTEXT}
                    keyboardType="numeric"
                    onSubmitEditing={handleCustomAdd}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleCustomAdd}>
                    <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* History List */}
        <View style={[styles.section, { paddingBottom: 20 }]}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's History</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.historyList}>
                {history.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                        <View style={styles.historyLeft}>
                            <View style={styles.historyIconContainer}>
                                <MaterialCommunityIcons name={item.icon as any} size={20} color={PRIMARY} />
                            </View>
                            <View>
                                <Text style={styles.historyLabel}>{item.label}</Text>
                                <Text style={styles.historyTime}>{item.time}</Text>
                            </View>
                        </View>
                        <View style={styles.historyRight}>
                            <Text style={styles.historyAmount}>+{item.amount}ml</Text>
                            <TouchableOpacity onPress={() => deleteItem(item.id, item.amount)}>
                                <MaterialIcons name="delete" size={20} color={SUBTEXT} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </View>

        {/* Hydration Reminder Button */}
        <View style={styles.footerSection}>
             <TouchableOpacity style={styles.reminderButton} activeOpacity={0.9}>
                  <MaterialIcons name="notifications-active" size={20} color={BG_DARK} />
                  <Text style={styles.reminderButtonText}>SAVE HYDRATION REMINDER</Text>
              </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(18, 20, 10, 0.8)', // BG_DARK with opacity
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_COLOR,
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(204, 255, 0, 0.7)',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Calendar
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 4,
  },
  dayName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: SUBTEXT,
    textTransform: 'uppercase',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDayCircle: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  activeDayNumber: {
    color: BG_DARK,
  },
  // Progress
  progressSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  ringContainer: {
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 5,
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  consumedText: {
    fontSize: 36,
    fontWeight: '800',
    color: TEXT_COLOR,
    letterSpacing: -1,
  },
  separatorText: {
    fontSize: 24,
    fontWeight: '500',
    color: SUBTEXT,
    marginHorizontal: 2,
  },
  goalText: {
    fontSize: 24,
    fontWeight: '500',
    color: SUBTEXT,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
    marginTop: 4,
  },
  dailyGoalContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  dailyGoalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  dailyGoalSubtitle: {
    color: SUBTEXT,
    fontSize: 14,
    marginTop: 4,
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  quickLogBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  quickLogText: {
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
  },
  // Buttons Grid
  quickButtonsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // dark:bg-primary/5
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.2)',
  },
  quickButtonText: {
    fontWeight: '700',
    fontSize: 14,
    color: TEXT_COLOR,
  },
  // Input
  customInputContainer: {
    position: 'relative',
    marginTop: 8,
  },
  inputIconContainer: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  input: {
    width: '100%',
    paddingLeft: 48,
    paddingRight: 80,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: TEXT_COLOR,
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    bottom: 8,
    paddingHorizontal: 16,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: BG_DARK,
    fontWeight: '700',
    fontSize: 12,
  },
  // History
  viewAllText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.8)',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: TEXT_COLOR,
  },
  historyTime: {
    fontSize: 11,
    color: SUBTEXT,
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyAmount: {
    fontWeight: '700',
    color: PRIMARY,
    fontSize: 14,
  },
  // Footer
  footerSection: {
      paddingHorizontal: 16,
      paddingBottom: 20,
  },
  reminderButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  reminderButtonText: {
    color: BG_DARK,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
