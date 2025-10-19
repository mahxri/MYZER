import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('myzer_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signup = (username: string, email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('myzer_users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      toast.error('Email already registered');
      return false;
    }

    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem('myzer_users', JSON.stringify(users));
    
    const userData = { username, email };
    localStorage.setItem('myzer_user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Account created successfully!');
    navigate('/dashboard');
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('myzer_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      const userData = { username: user.username, email: user.email };
      localStorage.setItem('myzer_user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Welcome back!');
      navigate('/dashboard');
      return true;
    }

    toast.error('Invalid email or password');
    return false;
  };

  const logout = () => {
    localStorage.removeItem('myzer_user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
