import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const BG_DARK = "#0d0f06";
const PRIMARY = "#ccff00";
const SURFACE_LOWEST = "#000000";
const SURFACE_CONTAINER = "#181b0f";
const SURFACE_CONTAINER_HIGH = "#1e2114";
const SURFACE_CONTAINER_HIGHEST = "#242719";
const TEXT_WHITE = "#fdfdec";
const TEXT_MUTED = "#abac9c";
const OUTLINE = "#757768";

export default function FriendsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Following');
  const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);

  const friends = [
    {
      id: '1',
      name: 'Marcus Thorne',
      activity: 'Lifting • 45m ago',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-bjqdDC1tI1uCGvXfl3FQRgQcjrGZ7QtjXj-ZB3VKVde79b46teYQhg449NTTPb7BI7y5dHF1U9EeT0fYl5Q0rwyK2Q99uTdg-x2QtWFpd3ZfrNB2n0wKRgTFG-QAW8lnUEk5fnAsrhSmuU4Ku5wxqH2YaovKOT7plJYiVHIt7Myzc2DUf5FSwwQsaz6L_nSVOB1qrfwsC3DxrHKGSc708xSsSvYsM51Ffg0H2c-rOoIi9UjTD_KcAQeevgFBWGUC5sWK_FObdXI',
      online: true,
    },
    {
      id: '2',
      name: 'Sarah Jenkins',
      activity: 'HIIT • Active Now',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPd8t3Yqy29RaEs2gPAc2dX4oibCMyXP0MSAIQaG-4V2DB_T8fZckGfvB-TcWL_CQ9ElJpKdYSb4wEu37ZEK6M1tzWT4LpFVLlUXcfu4Xj_iwoyVvGCye0KlIhSEKMMGJtDlLUszFV73BIubNuPaUltKwNU7ThAlQF3b5BekFARcSCVQ7baHIBoRdfT9teHgukKkddnvFf7TXHxyIjvDK2Vewk1uvlVvtzHKgV4WLa7Zgwqyax7TaUGqJ85N2q4BqsuSwL1ntxbUc',
      online: true,
    },
    {
      id: '3',
      name: 'David Chen',
      activity: 'Last seen 4h ago',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB92iIVAZTegRCUmy7WrvmMY02DJLQIWNGBa0jOJfVTgzfSU34gtcTQ4Wmztw86aq0b59VvyUvS8080Yx84WzH048g5tcWf33nDtUfGpaYzOdrLxhxuwjNGgTDV6_ou6pZlu44sJGB_cOzRSXdhjI0nIKugDSJgP5q0SQAE0ECrvMJQsPpGRpY2vORKPR7CoCwttAL76tPbUUCIW74kE0fBP1UginfMl4nKsfyjf4H0Rnkq9BYf2G8iRtG11HqP3DJQIJT8ouY3A80',
      online: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
      
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Search and Filter Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={24} color={TEXT_MUTED} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Find athletes, friends, or squads..."
              placeholderTextColor={OUTLINE}
            />
          </View>

          {/* Custom Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'Following' && styles.activeTabButton]}
              onPress={() => setActiveTab('Following')}
            >
              <Text style={[styles.tabText, activeTab === 'Following' && styles.activeTabText]}>FOLLOWING</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'Followers' && styles.activeTabButton]}
              onPress={() => setActiveTab('Followers')}
            >
              <Text style={[styles.tabText, activeTab === 'Followers' && styles.activeTabText]}>FOLLOWERS</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.addFriendButton} 
            activeOpacity={0.8}
            onPress={() => setIsAddFriendModalVisible(true)}
          >
            <MaterialIcons name="person-add" size={20} color={BG_DARK} />
            <Text style={styles.addFriendText}>ADD FRIEND</Text>
          </TouchableOpacity>
        </View>

        {/* Friends List Section */}
        <View style={styles.friendsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Friends</Text>
            <Text style={styles.onlineCount}>12 ONLINE</Text>
          </View>

          <View style={styles.friendsList}>
            {friends.map((friend) => (
              <TouchableOpacity key={friend.id} style={styles.friendItem} activeOpacity={0.7}>
                <View style={styles.friendInfo}>
                  <View style={[styles.avatarContainer, !friend.online && { opacity: 0.6 }]}>
                    <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                    {friend.online && <View style={styles.onlineIndicator} />}
                  </View>
                  <View style={styles.friendDetails}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendActivity}>{friend.activity}</Text>
                  </View>
                </View>
                
                <View style={styles.actionButtons}>
                  {friend.online && (
                    <TouchableOpacity style={styles.actionBtnPrimary}>
                      <MaterialIcons name="bolt" size={20} color="#4a5e00" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionBtnSecondary}>
                    <MaterialIcons name="chat-bubble" size={20} color={TEXT_MUTED} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Invite Friends Section */}
        <View style={styles.inviteSection}>
          <View style={styles.inviteContent}>
            <Text style={styles.inviteTitle}>GROW YOUR SQUAD</Text>
            <Text style={styles.inviteText}>Invite friends to GreenFit and earn premium kinetic badges.</Text>
            
            <View style={styles.inviteButtons}>
              <TouchableOpacity style={styles.shareBtn}>
                <MaterialIcons name="share" size={16} color="#4a5e00" />
                <Text style={styles.shareBtnText}>SHARE LINK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactsBtn}>
                <MaterialIcons name="contacts" size={20} color="#4a5e00" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Abstract glow effect could be added here if needed */}
        </View>

      </ScrollView>

      {/* Add Friend Modal */}
      <Modal
        visible={isAddFriendModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddFriendModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={() => setIsAddFriendModalVisible(false)}
          />
          
          <View style={styles.modalContent}>
            {/* Search Input Container */}
            <View style={styles.modalSearchContainer}>
              <MaterialIcons name="search" size={24} color={PRIMARY} style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search athletes or friends..."
                placeholderTextColor={TEXT_MUTED}
                autoFocus={true}
              />
            </View>

            {/* Quick Search Tags */}
            <View style={styles.quickSearchContainer}>
              <Text style={styles.quickSearchTitle}>QUICK SEARCH</Text>
              <View style={styles.quickSearchTags}>
                {['@marcus_v', 'ELENA', 'Local Pros'].map((tag, index) => (
                  <TouchableOpacity key={index} style={styles.quickSearchTag}>
                    <Text style={styles.quickSearchTagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setIsAddFriendModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color={TEXT_MUTED} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
    backgroundColor: 'rgba(13, 15, 6, 0.8)', // For blur effect, React Native usually needs BlurView, using opacity as fallback
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: PRIMARY,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  searchSection: {
    marginBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_LOWEST,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: TEXT_WHITE,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 12,
    padding: 4,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#cafd00', // primary-container
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: TEXT_MUTED,
  },
  activeTabText: {
    color: '#4a5e00', // on-primary-container
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  addFriendText: {
    color: BG_DARK,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  friendsSection: {
    marginBottom: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY,
    letterSpacing: -0.5,
  },
  onlineCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  friendsList: {
    gap: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SURFACE_CONTAINER,
    padding: 16,
    borderRadius: 12,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: SURFACE_CONTAINER,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_WHITE,
    marginBottom: 4,
  },
  friendActivity: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    width: 40,
    height: 40,
    backgroundColor: '#cafd00', // primary-container
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecondary: {
    width: 40,
    height: 40,
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteSection: {
    backgroundColor: '#cafd00', // primary-container
    borderRadius: 12,
    padding: 24,
    overflow: 'hidden',
  },
  inviteContent: {
    position: 'relative',
    zIndex: 10,
  },
  inviteTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#4a5e00', // on-primary-container
    marginBottom: 8,
  },
  inviteText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#526900', // on-primary-fixed-variant
    maxWidth: 200,
    marginBottom: 24,
  },
  inviteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4a5e00', // on-primary-container
    borderRadius: 8,
    paddingVertical: 12,
  },
  shareBtnText: {
    color: '#cafd00', // primary-container
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  contactsBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 94, 0, 0.2)',
    backgroundColor: 'rgba(74, 94, 0, 0.1)',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 15, 6, 0.7)', // #0d0f06 with opacity
  },
  modalContent: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_CONTAINER_HIGH,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(117, 119, 104, 0.2)', // outline-variant with opacity
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalSearchIcon: {
    marginRight: 12,
  },
  modalSearchInput: {
    flex: 1,
    color: TEXT_WHITE,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  quickSearchContainer: {
    width: '100%',
    marginTop: 24,
  },
  quickSearchTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: TEXT_MUTED,
    marginBottom: 16,
  },
  quickSearchTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSearchTag: {
    backgroundColor: SURFACE_CONTAINER_HIGHEST,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickSearchTagText: {
    color: TEXT_WHITE,
    fontSize: 12,
    fontWeight: '500',
  },
  modalCloseButton: {
    marginTop: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});