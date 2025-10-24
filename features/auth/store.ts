// features/auth/store.ts
import * as Keychain from 'react-native-keychain';
import { create } from 'zustand';
import axiosClient from '../../lib/axios';

interface EmergencyContact {
  emergency_id: number;
  name: string;
  relation: string;
  emergency_phone_number: string | null;
  emergency_email: string | null;     
  is_allow_alerts: boolean;
}

// Define the shape of user data
interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  emergency_contacts?: EmergencyContact[];
}

// Define the state and actions for store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => Promise<void>; 
  logout: () => Promise<void>; 
  setUser: (userData: User) => void;
  initializeAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // Action to handle successful login
  login: async (userData, token) => {
    set({ user: userData, token, isAuthenticated: true });

    try {
      // ONLY try to save if the token is a valid string
      if (token) {
        await Keychain.setGenericPassword('authToken', token);
        console.log('Token saved successfully!');
      } else {
        console.warn('Attempted to save an undefined token.');
      }
    } catch (error) {
      console.error('Failed to save the token to keychain', error);
    }
  },


  // Action to handle logout
  logout: async () => {
    // Clear the state in Zustand
    set({ user: null, token: null, isAuthenticated: false });
    
    // Securely remove the token from the device's keychain
    try {
      await Keychain.resetGenericPassword();
      console.log('Token removed successfully!');
    } catch (error) {
      console.error('Failed to remove the token from keychain', error);
    }
  },
  
  // Action to update user data
  setUser: (userData) => {
    set({ user: userData });
  },

  /**
   * Checks for a saved token in the keychain on app start.
   * If a token is found, it validates it by fetching the user profile.
   */
  initializeAuth: async () => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const token = credentials.password;
        
        // Set token for subsequent API requests
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user profile to validate the token
        const response = await axiosClient.get('/auth/profile');
        const user = response.data;

        // If successful, log the user in
        get().login(user, token);
        return true;
      }
      return false;
    } catch (error) {
      console.log('No valid session found or session expired:', error);
      // If token is invalid or fetching profile fails, do nothing.
      // The user will be treated as logged out.
      get().logout(); // Optional: ensure keychain is cleared on auth error
      return false;
    }
  },
}));

