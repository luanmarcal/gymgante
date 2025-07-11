import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  collection,
  addDoc,
  query,
  orderBy,
  Timestamp,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';

interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};


function getChatId(trainerId: string, alunoId: string) {
  return `${trainerId}_${alunoId}`;
}

export const sendMessage = createAsyncThunk<
  Message,
  { senderId: string; receiverId: string; text: string; trainerId: string; alunoId: string },
  { rejectValue: string }
>('chat/sendMessage', async (msg, { rejectWithValue }) => {
  try {
    const chatId = getChatId(msg.trainerId, msg.alunoId);
    const chatDocRef = doc(FIREBASE_DB, 'chats', chatId);
    await setDoc(
      chatDocRef,
      {
        trainerId: msg.trainerId,
        alunoId: msg.alunoId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    const messagesRef = collection(chatDocRef, 'messages');
    const timestamp = Timestamp.now().toDate().toISOString();
    const ref = await addDoc(messagesRef, {
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      text: msg.text,
      timestamp,
    });
    return { id: ref.id, ...msg, timestamp };
  } catch (error: any) {
    console.error('Erro no sendMessage:', error);
    return rejectWithValue(error.message || 'Erro ao enviar mensagem');
  }
});

export const fetchMessages = createAsyncThunk<
  Message[],
  { trainerId: string; alunoId: string },
  { rejectValue: string }
>('chat/fetchMessages', async ({ trainerId, alunoId }, { rejectWithValue }) => {
  try {
    const chatId = getChatId(trainerId, alunoId);
    const messagesRef = collection(FIREBASE_DB, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const snapshot = await getDocs(q);

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Message),
    }));

    return messages;
  } catch (error: any) {
    console.error('Erro no fetchMessages:', error);
    return rejectWithValue(error.message || 'Erro ao buscar mensagens');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages(state) {
      state.messages = [];
      state.error = null;
      state.loading = false;
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (!state.messages.find(msg => msg.id === action.payload.id)) {
          state.messages.push(action.payload);
        }
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload || 'Erro ao enviar mensagem';
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.error = action.payload || 'Erro ao buscar mensagens';
        state.loading = false;
      });
  },
});

export const { clearMessages, setMessages } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
