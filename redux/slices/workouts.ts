import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
} from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';

interface Exercise {
  id: string;
  name: string;
  description: string;
}

interface Workout {
  id: string;
  title: string;
  exerciseIds: string[];
}

interface WorkoutsState {
  exercises: Exercise[];
  workouts: Workout[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkoutsState = {
  exercises: [],
  workouts: [],
  loading: false,
  error: null,
};

export const fetchExercises = createAsyncThunk('workouts/fetchExercises', async (_, { rejectWithValue }) => {
  try {
    const q = query(collection(FIREBASE_DB, 'exercises'));
    const snapshot = await getDocs(q);
    const exercises: Exercise[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Exercise, 'id'>),
    }));
    return exercises;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const addExercise = createAsyncThunk('workouts/addExercise', async (
  exercise: Omit<Exercise, 'id'>,
  { rejectWithValue }
) => {
  try {
    console.log('addExercise: adicionando exercício no Firestore', exercise);
    const docRef = await addDoc(collection(FIREBASE_DB, 'exercises'), exercise);
    console.log('addExercise: exercício adicionado com ID:', docRef.id);
    return { id: docRef.id, ...exercise };
  } catch (error: any) {
    console.error('addExercise: erro ao adicionar exercício', error);
    return rejectWithValue(error.message);
  }
});

export const deleteExercise = createAsyncThunk('workouts/deleteExercise', async (
  exerciseId: string,
  { rejectWithValue }
) => {
  try {
    await deleteDoc(doc(FIREBASE_DB, 'exercises', exerciseId));
    return exerciseId;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateExercise = createAsyncThunk('workouts/updateExercise', async (
  { id, data }: { id: string; data: Partial<Omit<Exercise, 'id'>> },
  { rejectWithValue }
) => {
  try {
    await updateDoc(doc(FIREBASE_DB, 'exercises', id), data);
    console.log('Exercício atualizado no Firestore:', id, data);
    return { id, data };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchWorkouts = createAsyncThunk('workouts/fetchWorkouts', async (_, { rejectWithValue }) => {
  try {
    const q = query(collection(FIREBASE_DB, 'workouts'));
    const snapshot = await getDocs(q);
    const workouts: Workout[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Workout, 'id'>),
    }));
    return workouts;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const addWorkout = createAsyncThunk('workouts/addWorkout', async (
  workout: Omit<Workout, 'id'>,
  { rejectWithValue }
) => {
  try {
    const docRef = await addDoc(collection(FIREBASE_DB, 'workouts'), workout);
    return { id: docRef.id, ...workout };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const deleteWorkout = createAsyncThunk('workouts/deleteWorkout', async (
  workoutId: string,
  { rejectWithValue }
) => {
  try {
    await deleteDoc(doc(FIREBASE_DB, 'workouts', workoutId));
    return workoutId;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateWorkout = createAsyncThunk('workouts/updateWorkout', async (
  { id, data }: { id: string; data: Partial<Omit<Workout, 'id'>> },
  { rejectWithValue }
) => {
  try {
    await updateDoc(doc(FIREBASE_DB, 'workouts', id), data);
    console.log('Treino atualizado no Firestore:', id, data);
    return { id, data };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action: PayloadAction<Exercise[]>) => {
        state.loading = false;
        state.exercises = action.payload;
        console.log('Exercícios carregados:', action.payload);
      })
      .addCase(fetchExercises.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addExercise.fulfilled, (state, action: PayloadAction<Exercise>) => {
        state.exercises.push(action.payload);
      })
      .addCase(deleteExercise.fulfilled, (state, action: PayloadAction<string>) => {
        state.exercises = state.exercises.filter((e) => e.id !== action.payload);
      })
      .addCase(updateExercise.fulfilled, (state, action: PayloadAction<{ id: string; data: Partial<Omit<Exercise, 'id'>> }>) => {
        const index = state.exercises.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.exercises[index] = { ...state.exercises[index], ...action.payload.data };
        }
      })
      .addCase(fetchWorkouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action: PayloadAction<Workout[]>) => {
        state.loading = false;
        state.workouts = action.payload;
      })
      .addCase(fetchWorkouts.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addWorkout.fulfilled, (state, action: PayloadAction<Workout>) => {
        state.workouts.push(action.payload);
      })
      .addCase(deleteWorkout.fulfilled, (state, action: PayloadAction<string>) => {
        state.workouts = state.workouts.filter((w) => w.id !== action.payload);
      })
      .addCase(updateWorkout.fulfilled, (state, action: PayloadAction<{ id: string; data: Partial<Omit<Workout, 'id'>> }>) => {
        const index = state.workouts.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.workouts[index] = { ...state.workouts[index], ...action.payload.data };
        }
      });
  },
});

export const workoutsReducer = workoutsSlice.reducer;
