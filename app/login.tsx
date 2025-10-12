// app/login.tsx
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../features/auth/store';
import axiosClient from '../lib/axios';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();  

  // login action from the Zustand store
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    console.log('Attempting to log in with:', email, password);
    setIsLoading(true); 

    try {
      // API call
      const response = await axiosClient.post('/auth/login', {
        user_email: email, 
        user_password: password, 
      });

      console.log('API Response Data:', JSON.stringify(response.data, null, 2));

      const { access_token: token } = response.data;

      if (!token) {
        throw new Error('Login successful, but no token was received.');
      }

      // Use the token to fetch the user's profile
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const profileResponse = await axiosClient.get('/auth/profile');
      const user = profileResponse.data;

      // user and token, update the state
      login(user, token);

      // Navigate to the main app
      console.log('Logging in with:', email, password);
      router.replace('/home');

    } catch (error: any) {
      // Handle login errors 
      console.log('error :', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Logo and Title Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>MemoParkApp</Text>
          <Text style={styles.subtitle}>Find • Recall • Navigate</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your email" 
              placeholderTextColor= {COLORS.placeholderText}
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none"
              editable={!isLoading}  
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Your password" 
              placeholderTextColor= {COLORS.placeholderText}
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry
              editable={!isLoading} 
            />
          </View>
        </View>

        {/* Bottom Section with Button and Link */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>No account? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Create one</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.lightGray,
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: { 
    width: 70, 
    height: 70,
  },
  title: { 
    fontSize: 36, 
    fontWeight: '600', 
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: { 
    fontSize: 16, 
    color: COLORS.gray,
    letterSpacing: 0.5,
  },
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: { 
    fontSize: 16, 
    color: COLORS.dark,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: { 
    height: 50, 
    backgroundColor: COLORS.white,
    borderColor: COLORS.inputBorder, 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    fontSize: 15,
    color: COLORS.dark,
  },
  bottomSection: {
    paddingBottom: 40,
  },
  button: { 
    backgroundColor: COLORS.primary, 
    height: 50,
    borderRadius: 8, 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: '600', 
  },
  footer: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { 
    color: COLORS.dark, 
    fontSize: 14, 
  },
  link: { 
    color: COLORS.link, 
    fontSize: 14,
    fontWeight: '500',
  },
   buttonDisabled: {
    backgroundColor: COLORS.gray,
  },
});