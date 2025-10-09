// app/register.tsx
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

export default function RegisterScreen() {
  // Add all the state variables from the previous example here
  // const [fullName, setFullName] = useState(''); etc.
  const router = useRouter();

  const handleCreateAccount = () => {
    // Add validation logic here
    console.log('Creating account...');
  };

  return (
    // Add the full JSX from the previous RegisterScreen example here
    // Remember to use <Link> for navigation
    <SafeAreaView style={styles.safeArea}>
       <ScrollView>
         {/* All form content goes here... */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerText, styles.link]}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
       </ScrollView>
    </SafeAreaView>
  );
}
// Add the full styles from the previous RegisterScreen example here
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightGray },
  // ... all other styles
});