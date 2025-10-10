// app/register.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);
  
  // Emergency contact fields
  const [contactName, setContactName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [allowAlerts, setAllowAlerts] = useState(false);
  
  const router = useRouter();

  const handleRegister = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please accept the Privacy Policy.');
      return;
    }
    console.log('Registering with:', { fullName, email, password });
    // On success, navigate to login or main app
    // router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.title}>Create your account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.placeholderText}
                value={fullName} 
                onChangeText={setFullName} 
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.placeholderText}
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={COLORS.placeholderText}
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput 
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor={COLORS.placeholderText}
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                secureTextEntry
              />
            </View>

            {/* Privacy Policy Checkbox */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
              >
                <View style={styles.checkbox}>
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                I agree to share anonymised app usage data for research purposes and accept the{' '}
                <Text 
                  style={styles.linkText}
                  onPress={() => {
                    // Navigate to privacy policy screen
                    // router.push('/privacy-policy');
                    console.log('Navigate to Privacy Policy');
                  }}
                >
                  Privacy Policy.
                </Text>
              </Text>
            </View>

            {/* Emergency Contact Section */}
            <TouchableOpacity 
              style={styles.emergencyHeader}
              onPress={() => setShowEmergencyContact(!showEmergencyContact)}
              activeOpacity={0.7}
            >
              <Text style={styles.emergencyHeaderText}>
                Add Emergency Contact (optional)
              </Text>
              <Ionicons 
                name={showEmergencyContact ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.dark}
              />
            </TouchableOpacity>

            {showEmergencyContact && (
              <View style={styles.emergencySection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact name</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter contact name"
                    placeholderTextColor={COLORS.placeholderText}
                    value={contactName} 
                    onChangeText={setContactName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Relationship</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="e.g., Spouse, Parent, Friend"
                    placeholderTextColor={COLORS.placeholderText}
                    value={relationship} 
                    onChangeText={setRelationship}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mobile number</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter mobile number"
                    placeholderTextColor={COLORS.placeholderText}
                    value={mobileNumber} 
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.optionalText}>Optional</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter email address"
                    placeholderTextColor={COLORS.placeholderText}
                    value={emergencyEmail} 
                    onChangeText={setEmergencyEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setAllowAlerts(!allowAlerts)}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkbox}>
                    {allowAlerts && (
                      <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    Allow emergency alerts to notify this contact
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Create account</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: { 
    width: 50, 
    height: 50,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '600', 
    color: COLORS.dark,
  },
  formSection: {
    flex: 1,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: { 
    fontSize: 14, 
    color: COLORS.dark,
    marginBottom: 6,
    fontWeight: '500',
  },
  optionalText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: -4,
    marginBottom: 6,
  },
  input: { 
    height: 48, 
    backgroundColor: COLORS.white,
    borderColor: COLORS.inputBorder, 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 14, 
    fontSize: 15,
    color: COLORS.dark,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.dark,
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.link,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  emergencyHeaderText: {
    fontSize: 15,
    color: COLORS.dark,
    fontWeight: '500',
  },
  emergencySection: {
    marginBottom: 10,
  },
  bottomSection: {
    paddingBottom: 30,
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
});