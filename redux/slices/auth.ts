import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { FIREBASE_AUTH } from '~/utils/firebase.client';

const initialState = {
  isLoggedIn: false,
  user: {},
  token: '',
  loading: false,
  error: {
    value: false,
    code: '',
    message: '',
  },
};

// Extra Reducers Functions
export const logoutRequest = createAsyncThunk('auth/logoutRequest', async () => {
  console.log('Logout request');
  await FIREBASE_AUTH.signOut();
  return true;
});

export const loginRequest = createAsyncThunk(
  'auth/loginRequest',
  async (userData: { email: string; password: string }) => {
    try {
      console.log('Login request');
      const { email, password } = userData;
      console.log(email, password);

      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      return { user, token };
    } catch (error) {
      console.log('Login error', error);

      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  }
);

// Config
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = {
        value: false,
        code: '',
        message: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          value: true,
          code: action.error.code || 'LOGIN_ERROR',
          message: action.error.message || 'Login failed',
        };
      })

      // Logout
      .addCase(logoutRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutRequest.fulfilled, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = {};
        state.token = '';
      })
      .addCase(logoutRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          value: true,
          code: action.error.code || 'LOGOUT_ERROR',
          message: action.error.message || 'Logout failed',
        };
      });
  },
});

export const { resetError } = authSlice.actions;
export const authReducer = authSlice.reducer;
