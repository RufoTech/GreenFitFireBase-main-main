import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
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

const BG_DARK = "#0d0f06";
const PRIMARY = "#ccff00";
const SECONDARY = "#ece856";
const TERTIARY = "#fce047";
const SURFACE_CONTAINER_LOW = "#12140a";
const SURFACE_CONTAINER = "#181b0f";
const SURFACE_CONTAINER_HIGH = "#1e2114";
const TEXT_WHITE = "#fdfdec";
const TEXT_MUTED = "#abac9c";
const OUTLINE_VARIANT = "rgba(71, 73, 60, 0.2)";

export default function AthleteProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Workouts');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ATHLETE PROFILE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGradient}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmLjYnjwuuSs3amUYsc-G5ELW9EiKa0srZ7X93CFqNgRHn-mitFx9mscSaKoMxF8DFyvdCxGe1Upd-j74WZNrYGICLHBApv3AZzRHuabCJM-GwVjK5zF2dSdZeK66SqVz583PBeLg2BldTLJTrmIJ8ObmTsHqs_9t-YX_aLUCbB2wQZL23_hx1XSxy_MYGQ96XgKKzXtJ7zsvjKVHWHOe-LsZGOBSNXGWZk8l__kiKVNctL2AFzAF4OgZ0USKH6egkQ1qfu7nkR0I' }} 
                style={styles.avatar} 
              />
            </View>
            <View style={styles.eliteBadge}>
              <Text style={styles.eliteBadgeText}>ELITE ATHLETE</Text>
            </View>
          </View>

          <Text style={styles.profileName}>Marcus Thorne</Text>
          
          <Text style={styles.profileBio}>
            Strength & Conditioning | Powerlifter | Training for the Titan Nationals 2024. <Text style={styles.bioHighlight}>Never settle.</Text>
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>EDIT PROFILE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>SHARE PROFILE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1.2k</Text>
            <Text style={styles.statLabel}>FOLLOWERS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>348</Text>
            <Text style={styles.statLabel}>FOLLOWING</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesList}>
            <View style={styles.badgeCard}>
              <View style={[styles.badgeIconWrapper, { backgroundColor: 'rgba(204,255,0,0.1)' }]}>
                <MaterialIcons name="local-fire-department" size={32} color={PRIMARY} />
              </View>
              <Text style={styles.badgeText}>7 DAY STREAK</Text>
            </View>
            
            <View style={styles.badgeCard}>
              <View style={[styles.badgeIconWrapper, { backgroundColor: 'rgba(236,232,86,0.1)' }]}>
                <MaterialIcons name="fitness-center" size={32} color={SECONDARY} />
              </View>
              <Text style={styles.badgeText}>100KG BENCH</Text>
            </View>

            <View style={styles.badgeCard}>
              <View style={[styles.badgeIconWrapper, { backgroundColor: 'rgba(252,224,71,0.1)' }]}>
                <MaterialIcons name="directions-run" size={32} color={TERTIARY} />
              </View>
              <Text style={styles.badgeText}>ELITE RUNNER</Text>
            </View>

            <View style={[styles.badgeCard, { opacity: 0.4 }]}>
              <View style={[styles.badgeIconWrapper, { backgroundColor: 'rgba(171,172,156,0.1)' }]}>
                <MaterialIcons name="emoji-events" size={32} color={TEXT_MUTED} />
              </View>
              <Text style={styles.badgeText}>MARATHONER</Text>
            </View>
          </ScrollView>
        </View>

        {/* Activity Tabs */}
        <View style={styles.tabsContainer}>
          {['Workouts', 'Posts', 'Badges'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.activeTabBtnText]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Workouts Content */}
        {activeTab === 'Workouts' && (
          <View style={styles.workoutsList}>
            {/* Workout 1 */}
            <TouchableOpacity style={styles.workoutCard} activeOpacity={0.9}>
              <ImageBackground 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6dcaICpicxKfNF3IphCwW5iaAkb4oDllgP9unCERdKy5W4E4Evt9nnqES1aWxnGBuyANxVrZKYxdYsotNjFFYBY_NHZo4DFgTGzBau1Z2MmBFPChtkJRRrDAP8FrK8EshhksHclTPqfQNR6u5T2prC3ll3IZRxlxJB0YRaxfCogGPVvwnZ-mlVAXJEZz64qscz8qizSKc0sknG0RUtCLEOTaXM2C9N-AaofIRMvlzuJcA0K1lmqc_fUsSY-tBmf9GScYpCbkt3_c' }}
                style={styles.workoutImage}
              >
                <View style={styles.workoutImageOverlay} />
                <View style={styles.workoutTags}>
                  <View style={styles.workoutTagPrimary}>
                    <Text style={styles.workoutTagPrimaryText}>HEAVY DAY</Text>
                  </View>
                  <View style={styles.workoutTagDark}>
                    <Text style={styles.workoutTagDarkText}>45 MIN</Text>
                  </View>
                </View>
              </ImageBackground>
              <View style={styles.workoutInfo}>
                <View style={styles.workoutTitleRow}>
                  <Text style={styles.workoutTitle}>LEG DAY: MAX POWER OUTPUT</Text>
                  <MaterialIcons name="more-vert" size={20} color={TEXT_MUTED} />
                </View>
                <View style={styles.workoutDetailsRow}>
                  <View style={styles.workoutDetailItem}>
                    <MaterialIcons name="calendar-today" size={14} color={TEXT_MUTED} />
                    <Text style={styles.workoutDetailText}>OCT 24, 2023</Text>
                  </View>
                  <View style={styles.workoutDetailItem}>
                    <MaterialIcons name="bolt" size={14} color={PRIMARY} />
                    <Text style={[styles.workoutDetailText, { color: TEXT_MUTED }]}>840 KCAL</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Workout 2 */}
            <TouchableOpacity style={styles.workoutCard} activeOpacity={0.9}>
              <ImageBackground 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoyxT2clTKBTEN3wnL4jeRpwwLaWW1GXpqPq9KEqFlOARHtomglpQkCxnBffw5ynvhnEqpg-8rmqgjJd7vLeueBK6KcakFyJd0RO9x9lg46p37semftW2OLPOx7CO1sFgYMzdNVOQTqWK6PLfsbCKm5eshf8J3fklpKKJGrVoeuT8sOrkrqLa79dNRzRmQQOfjOF4VjRifo6KS7TJhukbWVkNzqXk_7T3V0Vo5wZxvxDvfP8O6yhJ5X7bYT46k6DIt77QgYgxCIYA' }}
                style={styles.workoutImage}
              >
                <View style={styles.workoutImageOverlay} />
                <View style={styles.workoutTags}>
                  <View style={[styles.workoutTagPrimary, { backgroundColor: SECONDARY }]}>
                    <Text style={[styles.workoutTagPrimaryText, { color: '#565400' }]}>METABOLIC</Text>
                  </View>
                  <View style={styles.workoutTagDark}>
                    <Text style={styles.workoutTagDarkText}>30 MIN</Text>
                  </View>
                </View>
              </ImageBackground>
              <View style={styles.workoutInfo}>
                <View style={styles.workoutTitleRow}>
                  <Text style={styles.workoutTitle}>HYPER-INTENSITY INTERVALS</Text>
                  <MaterialIcons name="more-vert" size={20} color={TEXT_MUTED} />
                </View>
                <View style={styles.workoutDetailsRow}>
                  <View style={styles.workoutDetailItem}>
                    <MaterialIcons name="calendar-today" size={14} color={TEXT_MUTED} />
                    <Text style={styles.workoutDetailText}>OCT 22, 2023</Text>
                  </View>
                  <View style={styles.workoutDetailItem}>
                    <MaterialIcons name="bolt" size={14} color={PRIMARY} />
                    <Text style={[styles.workoutDetailText, { color: TEXT_MUTED }]}>520 KCAL</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.endOfActivity}>
              <View style={styles.endLine} />
              <Text style={styles.endText}>END OF RECENT ACTIVITY</Text>
            </View>
          </View>
        )}

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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(13, 15, 6, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  content: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  avatarGradient: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: PRIMARY, // Simplified gradient for now
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 4,
    borderColor: BG_DARK,
  },
  eliteBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eliteBadgeText: {
    color: '#4a5e00',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  profileName: {
    color: TEXT_WHITE,
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginBottom: 16,
  },
  profileBio: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
    marginBottom: 32,
  },
  bioHighlight: {
    color: PRIMARY,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: OUTLINE_VARIANT,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionBtnText: {
    color: TEXT_WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: SURFACE_CONTAINER_LOW,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: OUTLINE_VARIANT,
    paddingVertical: 24,
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: OUTLINE_VARIANT,
  },
  statValue: {
    color: PRIMARY,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  achievementsSection: {
    marginBottom: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    color: TEXT_WHITE,
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    paddingLeft: 12,
    textTransform: 'uppercase',
  },
  viewAllText: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  badgesList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  badgeCard: {
    width: 112,
    height: 144,
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: OUTLINE_VARIANT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  badgeIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeText: {
    color: TEXT_WHITE,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: OUTLINE_VARIANT,
    paddingHorizontal: 24,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: PRIMARY,
  },
  tabBtnText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  activeTabBtnText: {
    color: PRIMARY,
    fontWeight: '900',
  },
  workoutsList: {
    padding: 24,
    gap: 24,
  },
  workoutCard: {
    backgroundColor: SURFACE_CONTAINER_HIGH,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: OUTLINE_VARIANT,
    overflow: 'hidden',
  },
  workoutImage: {
    height: 192,
    justifyContent: 'flex-end',
    padding: 16,
  },
  workoutImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  workoutTags: {
    flexDirection: 'row',
    gap: 8,
  },
  workoutTagPrimary: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  workoutTagPrimaryText: {
    color: '#4a5e00',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  workoutTagDark: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  workoutTagDarkText: {
    color: TEXT_WHITE,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  workoutInfo: {
    padding: 20,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workoutTitle: {
    flex: 1,
    color: TEXT_WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  workoutDetailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutDetailText: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  endOfActivity: {
    alignItems: 'center',
    marginTop: 32,
    opacity: 0.3,
  },
  endLine: {
    width: 40,
    height: 1,
    backgroundColor: PRIMARY,
    marginBottom: 16,
  },
  endText: {
    color: TEXT_WHITE,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
  },
});