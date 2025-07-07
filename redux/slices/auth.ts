import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { FIREBASE_AUTH, FIREBASE_DB } from '~/utils/firebase.client';

// Interface para definir a estrutura do nosso estado de autenticação
interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: {
    value: boolean;
    code: string | null;
    message: string | null;
  };
}

// Estado inicial com tipos corretos
const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
  loading: false,
  error: {
    value: false,
    code: null,
    message: null,
  },
};

// Thunk para REGISTRO de usuário
export const registerRequest = createAsyncThunk(
  'auth/registerRequest',
  async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      // Atualiza o nome do perfil
      await updateProfile(user, { displayName: name });

      const token = await user.getIdToken();

      return {
        user: {
          ...user,
          displayName: name, // força garantir que o Redux vai ver o displayName
        },
        token,
      };
    } catch (error: any) {
      return rejectWithValue({ code: error.code, message: error.message });
    }
  }
);


// Thunk para LOGIN de usuário
export const loginRequest = createAsyncThunk(
  'auth/loginRequest',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      return { user: JSON.parse(JSON.stringify(user)), token };
    } catch (error: any) {
      return rejectWithValue({ code: error.code, message: error.message });
    }
  }
);

// Thunk para LOGOUT de usuário
export const logoutRequest = createAsyncThunk('auth/logoutRequest', async (_, { rejectWithValue }) => {
  try {
    await FIREBASE_AUTH.signOut();
  } catch (error: any) {
    return rejectWithValue({ code: error.code, message: error.message });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = { value: false, code: null, message: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerRequest.pending, (state) => {
        state.loading = true;
        state.error = initialState.error;
      })
      .addCase(registerRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerRequest.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = {
          value: true,
          code: action.payload.code,
          message: action.payload.message,
        };
      })
      // Login cases
      .addCase(loginRequest.pending, (state) => {
        state.loading = true;
        state.error = initialState.error;
      })
      .addCase(loginRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginRequest.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = {
          value: true,
          code: action.payload.code,
          message: action.payload.message,
        };
      })
      // Logout cases
      .addCase(logoutRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutRequest.fulfilled, (state) => {
        return initialState; // Reseta para o estado inicial
      })
      .addCase(logoutRequest.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = {
          value: true,
          code: action.payload.code,
          message: action.payload.message,
        };
      });
  },
});

export const { resetError } = authSlice.actions;
export const authReducer = authSlice.reducer;
