// app/(tabs)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../features/auth/store';
import { useParkingStore } from '../../features/parking/store';

type TextSizeType = 'small' | 'medium' | 'large';
type IconSizeType = 'default' | 'medium' | 'large';
type LanguageType = 'en' | 'ma';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  console.log('User object from store:', JSON.stringify(user, null, 2));
  const clearActiveParking = useParkingStore((state) => state.clearActiveParkingSession);
  const router = useRouter();

  const [selectedTextSize, setSelectedTextSize] = useState<TextSizeType>('medium');
  const [selectedIconSize, setSelectedIconSize] = useState<IconSizeType>('default');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>('en');

  // Helper to get initials from name
  const getInitials = (name?: string) => {
    console.log(name);
    
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return `${names[0][0]}`.toUpperCase();
  };

  // Handle Logout
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          clearActiveParking();
          router.replace('/login');
        },
      },
    ]);
  };

  // Handle Language Change
  const handleLanguageChange = (language: LanguageType) => {
    setSelectedLanguage(language);
    // TODO: Implement actual language change logic using i18n
    console.log('Language changed to:', language);
  };

  // Radio Button Component
  const RadioButton = ({
    label,
    value,
    selected,
    onSelect,
  }: {
    label: string;
    value: TextSizeType | LanguageType;
    selected: boolean;
    onSelect: (value: any) => void;
  }) => (
    <TouchableOpacity style={styles.radioOption} onPress={() => onSelect(value)}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Icon Button Component
  const IconButton = ({
    label,
    value,
    selected,
    onSelect,
  }: {
    label: string;
    value: IconSizeType;
    selected: boolean;
    onSelect: (value: IconSizeType) => void;
  }) => (
    <TouchableOpacity
      style={[styles.iconButtonOption, selected && styles.iconButtonSelected]}
      onPress={() => onSelect(value)}
    >
      <Ionicons
        name="happy-outline"
        size={selected ? 32 : 24}
        color={selected ? COLORS.primary : COLORS.gray}
      />
      <Text style={[styles.iconButtonLabel, selected && styles.iconButtonLabelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Profile Header --- */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.user_name)}</Text>
          </View>
          <Text style={styles.name}>{user?.user_name || 'User Name'}</Text>
          <Text style={styles.email}>{user?.user_email || 'user@email.com'}</Text>
        </View>

        <View style={styles.divider} />

        {/* --- Accessibility Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>

          {/* Text Size Options */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Text size</Text>
            <View style={styles.radioContainer}>
              <RadioButton
                label="Small"
                value="small"
                selected={selectedTextSize === 'small'}
                onSelect={setSelectedTextSize}
              />
              <RadioButton
                label="Medium"
                value="medium"
                selected={selectedTextSize === 'medium'}
                onSelect={setSelectedTextSize}
              />
              <RadioButton
                label="Large"
                value="large"
                selected={selectedTextSize === 'large'}
                onSelect={setSelectedTextSize}
              />
            </View>
          </View>

          {/* Icon Size Options */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Icon size</Text>
            <View style={styles.iconButtonContainer}>
              <IconButton
                label="Default"
                value="default"
                selected={selectedIconSize === 'default'}
                onSelect={setSelectedIconSize}
              />
              <IconButton
                label="Medium"
                value="medium"
                selected={selectedIconSize === 'medium'}
                onSelect={setSelectedIconSize}
              />
              <IconButton
                label="Large"
                value="large"
                selected={selectedIconSize === 'large'}
                onSelect={setSelectedIconSize}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- Preferences Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Language Options */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Language</Text>
            <View style={styles.languageContainer}>
              <RadioButton
                label="English"
                value="en"
                selected={selectedLanguage === 'en'}
                onSelect={handleLanguageChange}
              />
              <RadioButton
                label="Te Reo Māori"
                value="ma"
                selected={selectedLanguage === 'ma'}
                onSelect={handleLanguageChange}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- Logout Button --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Extra padding for scroll */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.white,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D8BFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#5A4570',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.gray,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 0,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 20,
  },

  // Option Groups
  optionGroup: {
    marginBottom: 24,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 14,
  },

  // Radio Buttons (Text Size & Language)
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 40,
  },
  radioOption: {
    alignItems: 'center',
    padding: 8,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.dark,
  },

  // Icon Buttons
  iconButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 12,
  },
  iconButtonOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    minHeight: 120,
  },
  iconButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E0E7FF',
  },
  iconButtonLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
  },
  iconButtonLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Logout Button
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
