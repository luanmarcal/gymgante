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
import { sendMessage, clearMessages, setMessages } from '~/redux/slices/chat';
import { useAuth } from '~/contexts/auth-context';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  getDocs,
  Query,
  where,
} from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';

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

export default function ChatAluno() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const messages = useAppSelector((state) => state.chat.messages);
  const loading = useAppSelector((state) => state.chat.loading);
  const [newMessage, setNewMessage] = useState('');
  const [trainerUid, setTrainerUid] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrainerUid() {
      if (!user?.uid) return;
      try {
        const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          console.warn('Documento do usuário não encontrado');
          return;
        }
        const userData = userDocSnap.data() as any;
        const trainerCode = userData.trainerCode;
        if (!trainerCode) {
          console.warn('Usuário não tem trainerCode');
          return;
        }

        const usersRef = collection(FIREBASE_DB, 'users');
        const q = query(usersRef, where('trainerCode', '==', trainerCode));
        const querySnap = await getDocs(q);

        const treinadorDoc = querySnap.docs.find(
          (doc) => doc.id !== user.uid && doc.data().role === 'treinador'
        );

        if (!treinadorDoc) {
          console.warn('Nenhum treinador válido encontrado');
          return;
        }

        setTrainerUid(treinadorDoc.id);
      } catch (error) {
        console.error('Erro ao buscar treinador:', error);
      }
    }

    fetchTrainerUid();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !trainerUid) return;
    dispatch(clearMessages());

    const chatId = getChatId(trainerUid, user.uid);
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
  }, [user?.uid, trainerUid, dispatch]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.uid || !trainerUid) return;
    try {
      await dispatch(
        sendMessage({
          senderId: user.uid,
          receiverId: trainerUid,
          text: newMessage.trim(),
          trainerId: trainerUid,
          alunoId: user.uid,
        })
      );

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
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

  if (!trainerUid) {
    return (
      <View style={styles.centered}>
        <Text>Buscando treinador...</Text>
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
