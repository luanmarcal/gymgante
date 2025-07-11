import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '~/redux/store';
import { clearMessages, sendMessage, setMessages } from '~/redux/slices/chat';
import { useAuth } from '~/contexts/auth-context';
import { FIREBASE_DB } from '~/utils/firebase.client';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Query,
} from 'firebase/firestore';
import { useLocalSearchParams} from 'expo-router';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

function getChatId(trainerId: string, alunoId: string) {
  return `${trainerId}_${alunoId}`;
}

export default function ChatComAluno() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const { alunoId } = useLocalSearchParams<{ alunoId: string }>();
  const messages = useAppSelector((state) => state.chat.messages);
  const loading = useAppSelector((state) => state.chat.loading);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user?.uid || !alunoId) return;
    dispatch(clearMessages());
    const chatId = getChatId(user.uid, alunoId);
    const messagesRef = collection(FIREBASE_DB, 'chats', chatId, 'messages');
    const q: Query = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Message),
      }));
      dispatch(setMessages(allMessages));
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [user?.uid, alunoId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.uid || !alunoId) return;
    await dispatch(
      sendMessage({
        senderId: user.uid,
        receiverId: alunoId,
        text: newMessage.trim(),
        trainerId: user.uid,
        alunoId: alunoId,
      })
    );
    setNewMessage('');
  };

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isMe = item.senderId === user?.uid;
      return (
        <View
          style={[
            styles.messageContainer,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text style={{ color: isMe ? 'white' : 'black' }}>{item.text}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      );
    },
    [user?.uid]
  );
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.flatListContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Digite uma mensagem"
              value={newMessage}
              onChangeText={setNewMessage}
              style={styles.textInput}
              multiline
            />
            <Button mode="contained" onPress={handleSendMessage}>
              Enviar
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flatListContent: { padding: 16, paddingBottom: 80 },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    maxWidth: '75%',
  },
  myMessage: {
    backgroundColor: '#6200ee',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
});
