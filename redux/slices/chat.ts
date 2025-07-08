import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
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

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (msg: Omit<Message, 'id'>) => {
    const ref = await addDoc(collection(FIREBASE_DB, 'messages'), msg);
    return { ...msg, id: ref.id };
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
    const q = query(
      collection(FIREBASE_DB, 'messages'),
      where('senderId', 'in', [senderId, receiverId]),
      where('receiverId', 'in', [senderId, receiverId])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload.sort((a, b) =>
          a.timestamp.localeCompare(b.timestamp)
        );
      });
  },
});

export default chatSlice.reducer;
export const chatReducer = chatSlice.reducer;

