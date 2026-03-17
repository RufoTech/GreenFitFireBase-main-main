import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
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

const { width } = Dimensions.get('window');

const PRIMARY = '#ccff00';
const BG_DARK = '#1f230f';
const CARD_BG = '#1e293b'; // slate-800
const TEXT_LIGHT = '#f1f5f9'; // slate-100
const TEXT_MUTED = '#94a3b8'; // slate-400

export default function WorkoutCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get passed stats or use defaults
  const totalTime = params.totalTime || '45m';
  const volume = params.volume || '1200kg';
  const calories = params.calories || '350kcal';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Navigation */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FitFlow</Text>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="share" size={24} color={TEXT_MUTED} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWrXKryuijUaJvtoyKkuy4J6_8yTvBiIyJPAZvSmeBW7eGq50tXXgAJA45NGjMC_4gDEZ1QdIbGPdAW4MLx_q7Iz9YY7yZcg9Ch15OJXAyqxQUsqpxduQz-l3lnUFpXW1l-J7yxmhI-UqSiseUB-IRxpeg9CM---TdTHlIgZedx4sZstuiPN5_u-B4wJMcb6YpaQebryex2PcqOH1kBTNp23BiNcA0pr6t4EXJtnG8_aKL4gPCTz_tZ3MJ-4765QWKomvlHU7a55I' }}
            style={styles.heroImage}
            imageStyle={{ borderRadius: 16 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(31, 35, 15, 0.9)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(204, 255, 0, 0.1)' }]} />
            
            <View style={styles.heroContent}>
              <View style={styles.badgeContainer}>
                <MaterialIcons name="workspace-premium" size={16} color="#000" />
                <Text style={styles.badgeText}>EXCELLENT RESULT</Text>
              </View>
              <Text style={styles.heroTitle}>Workout Complete!</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="schedule" size={24} color={PRIMARY} style={styles.statIcon} />
            <Text style={styles.statLabel}>Total Time</Text>
            <Text style={styles.statValue}>{totalTime}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="fitness-center" size={24} color={PRIMARY} style={styles.statIcon} />
            <Text style={styles.statLabel}>Volume</Text>
            <Text style={styles.statValue}>{volume}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="local-fire-department" size={24} color={PRIMARY} style={styles.statIcon} />
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{calories}</Text>
          </View>
        </View>

        {/* Progress Mini Card */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCard}>
            <View style={styles.progressLeft}>
              <View style={styles.progressIconContainer}>
                <MaterialIcons name="trending-up" size={24} color="#000" />
              </View>
              <View>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Text style={styles.progressSubtitle}>You're 15% closer to your goal today</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={TEXT_MUTED} />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.replace('/(tabs)/')} // Replace to clear stack and go home
          >
            <MaterialIcons name="home" size={24} color="#000" />
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.replace('/screens/WorkoutHistoryScreen')} // Assuming this exists, or adjust route
          >
            <MaterialIcons name="history" size={24} color={TEXT_LIGHT} />
            <Text style={styles.secondaryButtonText}>Workout History</Text>
          </TouchableOpacity>
        </View>

        {/* Celebration Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Every move is a step forward. Keep going!</Text>
        </View>

      </ScrollView>
      
      {/* Decorative Element */}
      <View style={styles.decorativeLine}>
         <LinearGradient
            colors={['transparent', PRIMARY, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
         />
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContainer: {
    padding: 16,
  },
  heroImage: {
    width: '100%',
    minHeight: 240,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 16,
  },
  heroContent: {
    padding: 24,
    zIndex: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: BG_DARK, // Match dark theme
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIcon: {
    marginBottom: 4,
  },
  statLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.2)',
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressSubtitle: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '500',
  },
  decorativeLine: {
    height: 4,
    width: '100%',
    opacity: 0.5,
  }
});
