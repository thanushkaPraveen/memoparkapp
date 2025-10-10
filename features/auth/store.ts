import { create } from 'zustand';

// Define the shape of user data
interface User {
  id: number;
  fullName: string;
  email: string;
}

// Define the state and actions for store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: (userData: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // Action to handle successful login
  login: (userData, token) => {
    set({ user: userData, token, isAuthenticated: true });
    // Here save the token to secure storage (react-native-keychain)
  },

  // Action to handle logout
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    // Here remove the token from secure storage
  },
  
  // Action to update user data
  setUser: (userData) => {
    set({ user: userData });
  },
}));