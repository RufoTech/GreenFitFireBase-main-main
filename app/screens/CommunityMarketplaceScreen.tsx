import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import auth from '@react-native-firebase/auth';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

const PRIMARY = '#ccff00';
const BG_DARK = '#1f230f';

export default function CommunityMarketplaceScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'programs' | 'workouts'>('programs');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const currentUser = auth().currentUser;

  useEffect(() => {
    fetchCommunityItems();
  }, [activeTab]);

  const fetchCommunityItems = async () => {
    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) return;
      
      const token = await user.getIdToken();
      const type = activeTab === 'programs' ? 'programs' : 'workouts';
      
      const response = await fetch(`${API_URL}/api/community/items?type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const fetchedItems = await response.json();
      setItems(fetchedItems || []);
    } catch (error) {
      console.error("Error fetching community items:", error);
      Alert.alert("Error", "Could not load community items.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: any) => {
    if (!currentUser) return;
    if (item.authorId === currentUser.uid) {
      Alert.alert("Notice", "You already own this item.");
      return;
    }

    setDownloadingId(item.id);
    try {
      const token = await currentUser.getIdToken();
      const endpoint = activeTab === 'programs' ? '/api/community/download-program' : '/api/community/download-workout';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId: item.id })
      });

      if (!response.ok) {
        throw new Error('Failed to download item');
      }

      Alert.alert("Success", `${activeTab === 'programs' ? 'Program' : 'Workout'} downloaded to your library!`);
      // Update local state to show incremented downloads
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, downloads: (i.downloads || 0) + 1 } : i));
    } catch (error) {
      console.error("Error downloading item:", error);
      Alert.alert("Error", "Could not download the item.");
    } finally {
      setDownloadingId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isProgram = activeTab === 'programs';
    const subtitle = isProgram 
      ? `${item.workoutCount || 0} Workouts • ${item.focus || 'General'}`
      : `${item.duration || 0} Min • ${item.targetMuscle || 'Full Body'}`;

    return (
      <View style={styles.card}>
        <ImageBackground
          source={{ uri: item.coverImage || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.cardImage}
          imageStyle={{ borderRadius: 16 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.cardOverlay}
          />
          <View style={styles.authorBadge}>
            <MaterialIcons name="person" size={14} color="#1f230f" />
            <Text style={styles.authorText}>{item.authorName || 'Anonymous'}</Text>
          </View>
        </ImageBackground>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Feather name="download" size={14} color="#94a3b8" />
                <Text style={styles.statText}>{item.downloads || 0}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.downloadButton, item.authorId === currentUser?.uid && { opacity: 0.5 }]}
              onPress={() => handleDownload(item)}
              disabled={downloadingId === item.id || item.authorId === currentUser?.uid}
            >
              {downloadingId === item.id ? (
                <ActivityIndicator size="small" color="#1f230f" />
              ) : (
                <>
                  <Feather name="download" size={16} color="#1f230f" />
                  <Text style={styles.downloadButtonText}>
                    {item.authorId === currentUser?.uid ? 'Owned' : 'Get'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'programs' && styles.activeTab]}
          onPress={() => setActiveTab('programs')}
        >
          <Text style={[styles.tabText, activeTab === 'programs' && styles.activeTabText]}>
            Monthly Programs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'workouts' && styles.activeTab]}
          onPress={() => setActiveTab('workouts')}
        >
          <Text style={[styles.tabText, activeTab === 'workouts' && styles.activeTabText]}>
            Workouts
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="public" size={64} color="#334155" />
          <Text style={styles.emptyText}>No {activeTab} shared yet.</Text>
          <Text style={styles.emptySubtext}>Be the first to share one!</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  activeTab: {
    borderBottomColor: PRIMARY,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  activeTabText: {
    color: PRIMARY,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#0f1108',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardImage: {
    height: 180,
    width: '100%',
    justifyContent: 'space-between',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  authorBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f230f',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  downloadButtonText: {
    color: '#1f230f',
    fontWeight: '700',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
});
