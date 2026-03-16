import { MaterialIcons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const PRIMARY = "#ccff00";
const BG_DARK = "#12140a";
const SURFACE_DARK = "#1c1f0f";
const BORDER_DARK = "#2a2e18";
const TEXT_COLOR = "#f1f5f9";
const SUBTEXT_COLOR = "#94a3b8";

// API URL - Android Emulator üçün 10.0.2.2, digərləri üçün localhost
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

// Updated interfaces to match new structure
interface Movement {
  category: string;
  exerciseId: string;
  name: string;
  reps: string;
  setsCount: number;
  image?: string;
  videoUrl?: string;
  instructions?: string;
  muscleGroups?: { name: string; imageUrl: string }[]; // Optional, might need to fetch separately if not in initial load
}

interface WorkoutSet {
  label: string;
  movements: Movement[];
  rest: string;
}

interface ExerciseBlock {
  sets: WorkoutSet[];
}

interface FlattenedExerciseItem {
    movement: Movement;
    setLabel: string;
    blockIndex: number;
    setIndex: number;
    movementIndex: number;
    totalSets: number;
    currentSetNumber: number; // e.g. Set 1 of 4
}

export default function LiveWorkoutScreen() {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [workoutName, setWorkoutName] = useState("");
  
  // We need to flatten the nested structure into a linear list of "steps" for the live workout
  // Or handle it hierarchically. Linear is usually better for "Next/Prev" flow.
  // But we might want to group them by sets.
  // Let's flatten it: Each item in the array represents one "Set" of an exercise.
  // If an exercise has 4 sets, it will appear 4 times? 
  // Or we keep it as "Current Exercise" and track "Current Set".
  // The previous implementation had "currentIndex" pointing to an exercise.
  // Let's flatten to (Exercise + Set Number) so user clicks "Next" after each set.
  const [flatWorkoutQueue, setFlatWorkoutQueue] = useState<FlattenedExerciseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuscleModalVisible, setIsMuscleModalVisible] = useState(false);

  useEffect(() => {
    fetchWorkoutData();
  }, [workoutId]);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const cleanUrl = url.replace(/[\s"`']/g, "");
    
    const patterns = [
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        /^([a-zA-Z0-9_-]{11})$/ 
    ];

    for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
        if (match && match[0] && pattern.toString().includes('^')) {
             return match[0];
        }
    }
    return null;
  };

  const fetchWorkoutData = async () => {
    console.log("fetchWorkoutData STARTED");
    if (!workoutId) {
        console.log("fetchWorkoutData ABORTED: No workoutId provided");
        setLoading(false);
        return;
    }

    try {
      console.log("Getting current user...");
      const user = auth().currentUser;
      if (!user) {
          console.log("fetchWorkoutData ABORTED: No user logged in");
          return;
      }

      console.log("Getting ID token...");
      const token = await user.getIdToken();
      
      const url = `${API_URL}/api/workout-plan?workoutId=${workoutId}`;
      console.log(`Fetching workout plan from Go API: ${url}`);

      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Workout Plan Received");
      
      setWorkoutName(data.name || "Workout");

      // Flatten the structure
      const exercises: ExerciseBlock[] = data.exercises || [];
      const queue: FlattenedExerciseItem[] = [];

      exercises.forEach((block, bIdx) => {
        block.sets.forEach((set, sIdx) => {
            set.movements.forEach((movement, mIdx) => {
                // For each movement, we add it to the queue.
                // If the movement has multiple sets (setsCount > 1), do we add it multiple times?
                // Usually in a live workout app, yes, or we have a counter on the screen.
                // Let's add it multiple times so "Next" advances the set.
                // Or better: Keep one item but have internal state for "Current Set".
                // But simpler for navigation is to flatten everything.
                const setsCount = movement.setsCount || 1;
                for (let i = 1; i <= setsCount; i++) {
                    queue.push({
                        movement: movement,
                        setLabel: set.label,
                        blockIndex: bIdx,
                        setIndex: sIdx,
                        movementIndex: mIdx,
                        totalSets: setsCount,
                        currentSetNumber: i
                    });
                }
            });
        });
      });

      setFlatWorkoutQueue(queue);

    } catch (error) {
      console.error("Error fetching live workout data:", error);
      Alert.alert("Error", "Failed to load workout data.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flatWorkoutQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      Alert.alert("Workout Complete", "Great job! You've finished the workout.", [
        { text: "Finish", onPress: () => router.back() }
      ]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (flatWorkoutQueue.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: TEXT_COLOR }}>No exercises found for this workout.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: PRIMARY }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentItem = flatWorkoutQueue[currentIndex];
  const currentExercise = currentItem.movement;
  const progressPercent = Math.round(((currentIndex + 1) / flatWorkoutQueue.length) * 100);
  
  const videoId = currentExercise.videoUrl ? getYoutubeId(currentExercise.videoUrl) : null;
  const mainImage = currentExercise.image; // Already cleaned/processed in backend or consistent
  
  // Use category as muscle group fallback if muscleGroups missing
  const muscleName = currentExercise.category; 
  
  // Create Plyr HTML
  const plyrHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      <style>
        body { margin: 0; padding: 0; background-color: #1e293b; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        .plyr { width: 100%; height: 100%; }
        .plyr__video-wrapper { height: 100%; }
      </style>
    </head>
    <body>
      <div class="plyr__video-embed" id="player">
        <iframe
          src="https://www.youtube.com/embed/${videoId}?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1"
          allowfullscreen
          allowtransparency
          allow="autoplay"
        ></iframe>
      </div>
      <script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>
      <script>
        const player = new Plyr('#player', {
             controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
             youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
        });
      </script>
    </body>
    </html>
  `;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
      
      {/* Header & Progress Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
                <MaterialIcons name="fitness-center" size={24} color={PRIMARY} />
                <Text style={styles.headerTitle}>{workoutName}</Text>
            </View>
            <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => router.back()}
            >
                <MaterialIcons name="close" size={24} color="#f1f5f9" />
            </TouchableOpacity>
        </View>
        
        <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>WORKOUT PROGRESS</Text>
                <Text style={styles.progressValue}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Exercise Video/Animation Area */}
        <View style={styles.videoContainer}>
            {videoId ? (
                <View style={styles.videoWrapper}>
                    <WebView
                        style={styles.webView}
                        javaScriptEnabled={true}
                        allowsFullscreenVideo={true}
                        source={{ html: plyrHTML, baseUrl: "https://myapp.local" }}
                        mediaPlaybackRequiresUserAction={false}
                        renderLoading={() => (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={PRIMARY} />
                                <Text style={styles.loadingText}>
                                    Loading video player...
                                </Text>
                            </View>
                        )}
                    />
                </View>
            ) : (
                <ImageBackground
                    source={{ uri: mainImage || 'https://via.placeholder.com/400x225?text=No+Image' }}
                    style={styles.videoThumbnail}
                    imageStyle={{ opacity: 0.8 }}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(18, 20, 10, 0.8)']}
                        style={styles.videoOverlay}
                    />
                    
                    {/* Simulated controls for UI fidelity if no video */}
                    <View style={styles.videoControls}>
                        <View style={styles.videoTimeline}>
                            <View style={styles.videoProgress}>
                                <View style={styles.videoProgressFill}>
                                    <View style={styles.videoKnob} />
                                </View>
                            </View>
                        </View>
                        <View style={styles.timeLabels}>
                            <Text style={styles.timeText}>0:00</Text>
                            <Text style={styles.timeText}>--:--</Text>
                        </View>
                    </View>
                </ImageBackground>
            )}
        </View>

        {/* Set Info Banner */}
        <View style={styles.setInfoBanner}>
            <Text style={styles.setInfoText}>
                {currentItem.setLabel} • Set {currentItem.currentSetNumber} of {currentItem.totalSets}
            </Text>
        </View>

        {/* Exercise Title & Tip */}
        <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseTitle}>{currentExercise.name.toUpperCase()}</Text>
            <Text style={styles.exerciseTip}>{currentExercise.instructions?.slice(0, 100) || "Keep good form and control the movement"}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>REPS</Text>
                <Text style={styles.statValue}>{currentExercise.reps || "-"}</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>SET</Text>
                <View style={styles.setsValueContainer}>
                    <Text style={[styles.statValue, { color: PRIMARY }]}>{currentItem.currentSetNumber}</Text>
                    <Text style={[styles.statValue, { fontSize: 20, color: SUBTEXT_COLOR }]}>/{currentItem.totalSets}</Text>
                </View>
            </View>
        </View>

        {/* Muscle Info Section (Simplified if no image) */}
        <View style={styles.muscleMapCard}>
            <View style={styles.muscleMapCardHeader}>
                <View style={styles.muscleMapContainer}>
                     <MaterialIcons name="accessibility" size={60} color="rgba(255,255,255,0.4)" />
                </View>
                <View style={styles.muscleInfo}>
                    <Text style={styles.muscleInfoTitle}>Target Muscles</Text>
                    <View style={styles.muscleTags}>
                        <View style={[styles.muscleTag, { backgroundColor: PRIMARY }]}>
                            <Text style={[styles.muscleTagText, { color: BG_DARK }]}>
                                {muscleName.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>

        {/* Workout List Section (Up Next) */}
        <View style={styles.workoutListSection}>
            <TouchableOpacity 
                style={styles.workoutListHeader}
                onPress={() => setIsExpanded(!isExpanded)}
            >
                <View style={styles.workoutListTitleContainer}>
                    <MaterialIcons name="list-alt" size={20} color={PRIMARY} />
                    <Text style={styles.workoutListTitle}>UP NEXT</Text>
                </View>
                <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={24} color={PRIMARY} />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.workoutList}>
                    {flatWorkoutQueue.slice(currentIndex + 1, currentIndex + 6).map((item, index) => {
                        return (
                            <View 
                                key={index} 
                                style={styles.listItem}
                            >
                                <View style={styles.listItemLeft}>
                                    <View style={styles.inactiveDot} />
                                    <View>
                                        <Text style={styles.listItemText}>
                                            {item.movement.name}
                                        </Text>
                                        <Text style={styles.listItemSubText}>
                                            {item.setLabel} • Set {item.currentSetNumber}/{item.totalSets}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.listItemMeta}>
                                    {item.movement.reps} reps
                                </Text>
                            </View>
                        );
                    })}
                    {flatWorkoutQueue.length - currentIndex - 6 > 0 && (
                        <Text style={{ color: SUBTEXT_COLOR, textAlign: 'center', marginTop: 8 }}>
                            + {flatWorkoutQueue.length - currentIndex - 6} more sets
                        </Text>
                    )}
                </View>
            )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
            {currentIndex > 0 ? (
                <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
                    <MaterialIcons name="arrow-back" size={20} color="#f1f5f9" />
                    <Text style={styles.prevButtonText}>Previous</Text>
                </TouchableOpacity>
            ) : (
                <View style={{ flex: 1 }} /> // Spacer to keep Next button on right
            )}
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                    {currentIndex === flatWorkoutQueue.length - 1 ? "Finish" : "Next Set"}
                </Text>
                <MaterialIcons name={currentIndex === flatWorkoutQueue.length - 1 ? "check" : "arrow-forward"} size={20} color={BG_DARK} />
            </TouchableOpacity>
        </View>
      </View>
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
    padding: 16,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  progressValue: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    marginBottom: 16,
    position: 'relative',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  loadingText: {
    marginTop: 10,
    color: '#94a3b8',
    fontSize: 12,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  videoControls: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  videoTimeline: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoProgress: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  videoProgressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 2,
    position: 'relative',
  },
  videoKnob: {
    position: 'absolute',
    right: -6,
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: BG_DARK,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  setInfoBanner: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.2)',
  },
  setInfoText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exerciseHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  exerciseTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  exerciseTip: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
  },
  setsValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  muscleMapCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  muscleMapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  muscleMapContainer: {
    width: 80,
    height: 100,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleInfo: {
    flex: 1,
  },
  muscleInfoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  muscleTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  workoutListSection: {
    marginTop: 8,
    paddingBottom: 24,
  },
  workoutListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  workoutListTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutListTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  workoutList: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 12,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
  },
  listItemText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listItemSubText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  listItemMeta: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: BG_DARK,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  prevButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  prevButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 12,
    backgroundColor: PRIMARY,
  },
  nextButtonText: {
    color: BG_DARK,
    fontSize: 14,
    fontWeight: '900',
  },
});
