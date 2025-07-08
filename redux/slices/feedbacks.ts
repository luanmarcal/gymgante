// redux/slices/feedbacks.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';

export interface Feedback {
  id?: string;
  userId: string;
  comment: string;
  targetId: string;       // id do treino ou exercício
  targetType: 'exercise' | 'workout';
  createdAt?: any;
}

interface FeedbacksState {
  feedbackList: Feedback[];
  loading: boolean;
  error: string | null;
}

const initialState: FeedbacksState = {
  feedbackList: [],
  loading: false,
  error: null,
};

// Thunk para enviar feedback
export const sendFeedback = createAsyncThunk(
  'feedbacks/sendFeedback',
  async (feedback: Feedback, { rejectWithValue }) => {
    try {
      const feedbackRef = collection(FIREBASE_DB, 'feedbacks');
      const docRef = await addDoc(feedbackRef, {
        ...feedback,
        createdAt: Timestamp.now(),
      });
      return { ...feedback, id: docRef.id };
    } catch (error: any) {
      // Capture o erro e rejeite com valor customizado
      return rejectWithValue(error.message || 'Erro ao enviar feedback');
    }
  }
);


// Thunk para buscar feedbacks de um target (exercício ou treino)
export const fetchFeedbacksByTarget = createAsyncThunk(
  'feedbacks/fetchByTarget',
  async ({ targetId }: { targetId: string }) => {
    const feedbackRef = collection(FIREBASE_DB, 'feedbacks');
    const q = query(feedbackRef, where('targetId', '==', targetId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback));
  }
);

const feedbacksSlice = createSlice({
  name: 'feedbacks',
  initialState,
  reducers: {
    clearFeedbacks(state) {
      state.feedbackList = [];
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendFeedback.fulfilled, (state, action) => {
        state.feedbackList.push(action.payload);
        state.loading = false;
      })
      .addCase(sendFeedback.rejected, (state, action) => {
        state.error = action.error.message ?? 'Erro ao enviar feedback';
        state.loading = false;
      })

      .addCase(fetchFeedbacksByTarget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacksByTarget.fulfilled, (state, action) => {
        state.feedbackList = action.payload;
        state.loading = false;
      })
      .addCase(fetchFeedbacksByTarget.rejected, (state, action) => {
        state.error = action.error.message ?? 'Erro ao carregar feedbacks';
        state.loading = false;
      });
  }
});

export const { clearFeedbacks } = feedbacksSlice.actions;

export default feedbacksSlice.reducer;
export const feedbacksReducer = feedbacksSlice.reducer;