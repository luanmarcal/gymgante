import { User } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { ReactNode, createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

import { loginRequest, logoutRequest, registerRequest } from '~/redux/slices';
import { RootState, useAppDispatch } from '~/redux/store';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  register: (name: string, emailAddress: string, password: string) => Promise<void>;
  login: (emailAddress: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const login = async (emailAddress: string, password: string) => {
    try {
      await dispatch(loginRequest({ email: emailAddress, password })).unwrap();
      router.replace('/(main)/(tabs)/(home)');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, emailAddress: string, password: string) => {
    try {
      await dispatch(registerRequest({ name, email: emailAddress, password })).unwrap();
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
    <AuthContext.Provider value={{ isAuthenticated: isLoggedIn, user, register, login, logout }}>
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
