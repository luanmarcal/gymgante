import { User } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { ReactNode, createContext, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';

import {
  loginRequest,
  logoutRequest,
  registerRequest,
  fetchUserProfile,
} from '~/redux/slices/auth';
import { RootState, useAppDispatch } from '~/redux/store';

interface AuthContextType {
  user: User | null;
  userProfile: { role?: string; trainerCode?: string } | null;
  isAuthenticated: boolean;
  register: (
    name: string,
    emailAddress: string,
    password: string,
    whatsapp: string
  ) => Promise<void>;
  login: (emailAddress: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector((state: RootState) => state.auth.user);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  // Busca o perfil do usuário sempre que logar
  useEffect(() => {
    if (isLoggedIn && user?.uid) {
      dispatch(fetchUserProfile(user.uid));
    }
  }, [isLoggedIn, user, dispatch]);

  const login = async (emailAddress: string, password: string) => {
    try {
      await dispatch(loginRequest({ email: emailAddress, password })).unwrap();
      router.replace('/(main)/(tabs)/(home)');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, emailAddress: string, password: string, whatsapp: string) => {
    try {
      await dispatch(registerRequest({ name, email: emailAddress, password, whatsapp })).unwrap();
      router.replace('/(main)/(tabs)/(home)');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutRequest()).unwrap();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isLoggedIn,
        user,
        userProfile,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
