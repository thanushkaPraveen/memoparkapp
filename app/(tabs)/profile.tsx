import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../features/auth/store';
import { useParkingStore } from '../../features/parking/store';

export default function ProfileScreen() {
  const router = useRouter();
  // Get the logout action and user data from your Zustand store
  const { logout, user } = useAuthStore();
  const clearActiveParking = useParkingStore((state) => state.clearActiveParkingSession);

  const handleLogout = async () => {
    // Call the logout action from your store
    // This will clear the state and remove the token from the keychain
    await logout();

    // CLEAR the parking session state on logout
    clearActiveParking();
    
    // Navigate the user back to the login screen
    // 'replace' is used to prevent the user from going back to the profile screen
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {user?.fullName || 'User'}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#FF6347', // A reddish color for logout/destructive actions
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});