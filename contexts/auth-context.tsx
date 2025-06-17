import { useRouter } from 'expo-router';
import { ReactNode, createContext, useContext, useState } from 'react';
import { useSelector } from 'react-redux';

import { loginRequest, logoutRequest } from '~/redux/slices';
import { useAppDispatch } from '~/redux/store';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (emailAddress: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const count = useSelector((state: any) => state.counter.count);
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
  // const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const login = async (emailAddress: string, password: string) => {
    try {
      await dispatch(loginRequest({ email: emailAddress, password })).unwrap();
      console.log('login in tabs');
      // setIsAuthenticated(true);
      router.replace('/(main)/(tabs)/(home)');
    } catch (error) {
      console.error('Erro ao fazer login AAAAAA:', error);
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutRequest()).unwrap();
      console.log('logout in tabs');
      // setIsAuthenticated(false);
      router.replace('/(auth)');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated: isLoggedIn, login, logout }}>
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
