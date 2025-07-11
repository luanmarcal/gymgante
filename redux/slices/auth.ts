import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import { FIREBASE_AUTH, FIREBASE_DB } from '~/utils/firebase.client';

type UserRole = 'aluno' | 'treinador';

interface AuthState {
  isLoggedIn: boolean;
  user: Pick<User, 'uid' | 'email' | 'displayName'> | null;
  userProfile: {
    role?: UserRole;
    trainerCode?: string;
    alunos?: string[];
  } | null;
  token: string | null;
  loading: boolean;
  error: {
    value: boolean;
    code: string | null;
    message: string | null;
  };
  studentsList: UserProfile[];
}

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role?: UserRole;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  userProfile: null,
  token: null,
  loading: false,
  error: {
    value: false,
    code: null,
    message: null,
  },
  studentsList: [],
};

interface RegisterParams {
  name: string;
  email: string;
  password: string;
  whatsapp: string;
}

function generateTrainerCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const FIXED_TRAINER_CODE = 'ABC123'; // Código fixo para autenticação do treinador

export const registerRequest = createAsyncThunk(
  'auth/registerRequest',
  async (params: RegisterParams, { rejectWithValue }) => {
    try {
      const { name, email, password, whatsapp } = params;
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      const userData = {
        uid: user.uid,
        name,
        email,
        whatsapp,
        createdAt: serverTimestamp(),
      };

      console.log('Dados do usuário a salvar no Firestore:', userData);
      await setDoc(doc(FIREBASE_DB, 'users', user.uid), userData);
      const token = await user.getIdToken();
      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: name,
          whatsapp,
        },
        token,
      };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return rejectWithValue({ code: error.code, message: error.message });
    }
  }
);

export const loginRequest = createAsyncThunk(
  'auth/loginRequest',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      const serializableUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
      return { user: serializableUser, token };
    } catch (error: any) {
      return rejectWithValue({ code: error.code, message: error.message });
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (uid: string, { rejectWithValue }) => {
    try {
      const docRef = doc(FIREBASE_DB, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return rejectWithValue({
          code: 'auth/no-profile',
          message: 'Perfil do usuário não encontrado.',
        });
      }

      const data = docSnap.data();
      return { uid, ...data } as UserProfile;
    } catch (error: any) {
      return rejectWithValue({
        code: error.code || 'unknown',
        message: error.message || 'Erro inesperado.',
      });
    }
  }
);

export const fetchAllStudents = createAsyncThunk(
  'auth/fetchAllStudents',
  async (_, { rejectWithValue }) => {
    try {
      const q = query(collection(FIREBASE_DB, 'users'), where('role', '==', 'aluno'));
      const snapshot = await getDocs(q);

      const list: UserProfile[] = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...(doc.data() as Omit<UserProfile, 'uid'>),
      }));
      return list as UserProfile[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface UpdateUserProfileParams {
  uid: string;
  role: UserRole;
  trainerCode?: string;
}

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (params: UpdateUserProfileParams, { rejectWithValue }) => {
    try {
      const { uid, role, trainerCode } = params;
      const userDocRef = doc(FIREBASE_DB, 'users', uid);

      if (role === 'treinador') {
        if (trainerCode !== FIXED_TRAINER_CODE) {
          return rejectWithValue({
            code: 'auth/invalid-trainer-code',
            message: 'Código fixo do treinador inválido.',
          });
        }
        const generatedCode = generateTrainerCode();
        await updateDoc(userDocRef, {
          role,
          trainerCode: generatedCode,
          updatedAt: serverTimestamp(),
        });
        return { role, trainerCode: generatedCode };
      } else if (role === 'aluno') {
        await updateDoc(userDocRef, {
          role,
          updatedAt: serverTimestamp(),
        });
        return { role };
      } else {
        return rejectWithValue({
          code: 'auth/invalid-role',
          message: 'Role inválida.',
        });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return rejectWithValue({ code: error.code, message: error.message });
    }
  }
);

export const addStudentToTrainer = createAsyncThunk(
  'auth/addStudentToTrainer',
  async (params: { trainerCode: string; studentUid: string }, { rejectWithValue }) => {
    try {
      const q = query(collection(FIREBASE_DB, 'users'), where('trainerCode', '==', params.trainerCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return rejectWithValue({
          code: 'auth/trainer-not-found',
          message: 'Treinador com este código não foi encontrado.',
        });
      }
      const trainerDoc = snapshot.docs[0];
      const trainerDocRef = trainerDoc.ref;
      const trainerData = trainerDoc.data();
      if (trainerData.role !== 'treinador') {
        return rejectWithValue({
          code: 'auth/invalid-trainer',
          message: 'Usuário encontrado não é um treinador.',
        });
      }
      const alunos: string[] = trainerData.alunos || [];
      if (alunos.includes(params.studentUid)) {
        return rejectWithValue({
          code: 'auth/student-already-added',
          message: 'Aluno já está na turma.',
        });
      }
      alunos.push(params.studentUid);
      await updateDoc(trainerDocRef, { alunos });
      const alunoDocRef = doc(FIREBASE_DB, 'users', params.studentUid);
      await updateDoc(alunoDocRef, { trainerCode: params.trainerCode });
      const alunoSnap = await getDoc(alunoDocRef);
      const alunoData = alunoSnap.data();
      return {
        uid: params.studentUid,
        name: alunoData?.name,
        email: alunoData?.email,
        trainerCode: params.trainerCode,
      };
    } catch (error: any) {
      return rejectWithValue({ code: error.code, message: error.message });
    }
  }
);

export const removeStudentFromTrainer = createAsyncThunk(
  'auth/removeStudentFromTrainer',
  async (params: { trainerUid: string; studentUid: string }, { rejectWithValue }) => {
    try {
      const trainerDocRef = doc(FIREBASE_DB, 'users', params.trainerUid);
      const trainerDocSnap = await getDoc(trainerDocRef);

      if (!trainerDocSnap.exists()) {
        return rejectWithValue({
          code: 'auth/trainer-not-found',
          message: 'Treinador não encontrado.',
        });
      }
      const trainerData = trainerDocSnap.data();
      if (trainerData.role !== 'treinador') {
        return rejectWithValue({
          code: 'auth/invalid-trainer',
          message: 'Usuário não é um treinador.',
        });
      }
      const alunos: string[] = trainerData.alunos || [];
      if (!alunos.includes(params.studentUid)) {
        return rejectWithValue({
          code: 'auth/student-not-found',
          message: 'Aluno não está na sua turma.',
        });
      }
      const updatedAlunos = alunos.filter((uid) => uid !== params.studentUid);
      await updateDoc(trainerDocRef, { alunos: updatedAlunos });
      return params.studentUid;
    } catch (error: any) {
      return rejectWithValue({ code: error.code, message: error.message });
    }
  }
);

export const logoutRequest = createAsyncThunk(
  'auth/logoutRequest',
  async (_, { rejectWithValue }) => {
    try {
      await FIREBASE_AUTH.signOut();
    } catch (error: any) {
      return rejectWithValue({ code: error.code, message: error.message });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = { value: false, code: null, message: null };
    },
    clearUserProfile: (state) => {
      state.userProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = initialState.error;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
        console.log('Perfil do usuário carregado:', action.payload);
      })
      .addCase(fetchUserProfile.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.userProfile = null;
        state.error = {
          value: true,
          code: action.payload.code,
          message: action.payload.message,
        };
      })
      .addCase(fetchAllStudents.pending, (state) => {
        state.loading = true;
        state.error = initialState.error;
      })
      .addCase(fetchAllStudents.fulfilled, (state, action: PayloadAction<UserProfile[]>) => {
        state.loading = false;
        state.studentsList = action.payload;
      })
      .addCase(fetchAllStudents.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = {
          value: true,
          code: null,
          message: action.payload,
        };
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = initialState.error;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.userProfile) {
          state.userProfile.role = action.payload.role;
          state.userProfile.trainerCode = action.payload.trainerCode;
        } else {
          state.userProfile = {
            role: action.payload.role,
            trainerCode: action.payload.trainerCode,
          };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = {
          value: true,
          code: action.payload.code,
          message: action.payload.message,
        };
      })
      .addCase(addStudentToTrainer.pending, (state) => {
        state.loading = true;
        state.error = initialState.error;
      })
      .addCase(addStudentToTrainer.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.studentsList.some((student) => student.uid === action.payload.uid)) {
          state.studentsList = [...state.studentsList, action.payload];
        }
        console.log('Aluno adicionado ao treinador:', action.payload);
      })
      .addCase(addStudentToTrainer.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = {
          value: true,
          code: action.payload.code,
          message: action.payload.message,
        };
      })
      .addCase(removeStudentFromTrainer.pending, (state) => {
        state.loading = true;
        state.error = initialState.error;
      })
      .addCase(removeStudentFromTrainer.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        if (state.userProfile?.alunos) {
          state.userProfile.alunos = state.userProfile.alunos.filter(
            (uid) => uid !== action.payload
          );
        }
      })
      .addCase(removeStudentFromTrainer.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = {
          value: true,
          code: action.payload.code,
          message: action.payload.message,
        };
      })
      .addCase(logoutRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutRequest.fulfilled, () => {
        return initialState;
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

export const { resetError, clearUserProfile } = authSlice.actions;
export const authReducer = authSlice.reducer;
