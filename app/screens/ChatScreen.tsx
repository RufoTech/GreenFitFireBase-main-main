import { MaterialIcons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const BG_DARK = "#0d0f06";
const PRIMARY = "#ccff00";
const SURFACE_CONTAINER = "#181b0f";
const SURFACE_CONTAINER_HIGH = "#1e2114";
const TEXT_WHITE = "#fdfdec";
const TEXT_MUTED = "#abac9c";

export default function ChatScreen() {
  const router = useRouter();
  const { friendId, friendName, friendPhoto } = useLocalSearchParams();
  const user = auth().currentUser;

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Generate a unique chatId based on both UIDs
  const getChatId = () => {
    if (!user || !friendId) return '';
    return user.uid > String(friendId)
      ? `${user.uid}_${friendId}`
      : `${friendId}_${user.uid}`;
  };

  const chatId = getChatId();

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        if (!snapshot) return;
        
        const loadedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(loadedMessages);
      });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !user || !chatId) return;

    const messageData = {
      text: inputText.trim(),
      senderId: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    setInputText('');
    
    try {
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add(messageData);

      // Optionally update latest message in the chat document
      await firestore().collection('chats').doc(chatId).set({
        lastMessage: messageData.text,
        lastMessageTime: messageData.createdAt,
        participants: [user.uid, friendId]
      }, { merge: true });

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?.uid;

    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperFriend]}>
        {!isMe && (
          <Image source={{ uri: String(friendPhoto) }} style={styles.messageAvatar} />
        )}
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleFriend]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextFriend]}>
            {item.text}
          </Text>
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
          <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        
        <View style={styles.headerUserInfo}>
          <Image source={{ uri: String(friendPhoto) }} style={styles.headerAvatar} />
          <Text style={styles.headerName}>{friendName}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          inverted={true} // Newest messages at bottom
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={TEXT_MUTED}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <MaterialIcons name="send" size={20} color={BG_DARK} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: SURFACE_CONTAINER_HIGH,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerName: {
    color: TEXT_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    gap: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    maxWidth: '80%',
  },
  messageWrapperMe: {
    alignSelf: 'flex-end',
  },
  messageWrapperFriend: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleMe: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  messageBubbleFriend: {
    backgroundColor: SURFACE_CONTAINER,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMe: {
    color: BG_DARK,
    fontWeight: '500',
  },
  messageTextFriend: {
    color: TEXT_WHITE,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: SURFACE_CONTAINER_HIGH,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    color: TEXT_WHITE,
    fontSize: 15,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
});