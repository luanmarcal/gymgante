import { useRouter } from 'expo-router';
import { ReactNode, createContext, useContext, useState } from 'react';

// ✅ Define authentication context type
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}
// ✅ Create authentication context
const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  // ✅ Login function (Redirect to Home)
  const login = () => {
    setIsAuthenticated(true);
    router.replace('/(main)/(tabs)/home');
  };
  // ✅ Logout function (Redirect to Auth Screen)
  const logout = () => {
    setIsAuthenticated(false);
    router.replace('/');
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// ✅ Hook to use authentication state
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
