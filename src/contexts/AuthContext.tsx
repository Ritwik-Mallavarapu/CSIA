import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: 'trainee' | 'admin') => Promise<void>;
  signup: (data: { username: string; email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isTrainee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getCurrentUser()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((async () => {
      (async () => {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        } catch {
          setUser(null);
        }
      })();
    }));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: 'trainee' | 'admin') => {
    const response = await apiService.login({ email, password, role });
    setUser(response.user);
  };

  const signup = async (data: { username: string; email: string; password: string; fullName: string }) => {
    const response = await apiService.signup(data);
    setUser(response.user);
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin: user?.role === 'admin',
    isTrainee: user?.role === 'trainee',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
