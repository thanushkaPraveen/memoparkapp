// app/(tabs)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import {
  useAccessibilityStore,
  useScaledSizes,
  type IconSizeType,
  type LanguageType,
  type TextSizeType
} from '../../features/accessibility';
import { useAuthStore } from '../../features/auth/store';
import { useParkingStore } from '../../features/parking/store';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const clearActiveParking = useParkingStore((state) => state.clearActiveParkingSession);
  const router = useRouter();

  const { t } = useTranslation();

  // Get accessibility settings from store
  const textSize = useAccessibilityStore((state) => state.textSize);
  const iconSize = useAccessibilityStore((state) => state.iconSize);
  const language = useAccessibilityStore((state) => state.language);
  const setTextSize = useAccessibilityStore((state) => state.setTextSize);
  const setIconSize = useAccessibilityStore((state) => state.setIconSize);
  const setLanguage = useAccessibilityStore((state) => state.setLanguage);

  // Get scaled sizes for this screen's UI
  const { text, icon } = useScaledSizes();

  // Create dynamic styles based on text size
  const dynamicStyles = useMemo(() => {
    if (typeof text !== 'function') {
      return {
        avatarText: { fontSize: 36 },
        name: { fontSize: 22 },
        email: { fontSize: 14 },
        sectionTitle: { fontSize: 18 },
        optionLabel: { fontSize: 14 },
        radioLabel: { fontSize: 14 },
        iconButtonLabel: { fontSize: 14 },
        logoutButtonText: { fontSize: 16 },
        logoutIcon: 20,
      };
    }

    return {
      avatarText: { fontSize: text(36) },
      name: { fontSize: text(22) },
      email: { fontSize: text(14) },
      sectionTitle: { fontSize: text(18) },
      optionLabel: { fontSize: text(14) },
      radioLabel: { fontSize: text(14) },
      iconButtonLabel: { fontSize: text(14) },
      logoutButtonText: { fontSize: text(16) },
      logoutIcon: icon(20),
    };
  }, [text, icon]);

  // Helper to get initials from name
  const getInitials = (name?: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return `${names[0][0]}`.toUpperCase();
  };

  // UPDATED: Handle Logout with translated alert
  const handleLogout = async () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            clearActiveParking();
            router.replace('/login');
          },
        },
      ]
    );
  };

  // Handle Text Size Change
  const handleTextSizeChange = (size: TextSizeType) => {
    setTextSize(size);
  };

  // Handle Icon Size Change
  const handleIconSizeChange = (size: IconSizeType) => {
    setIconSize(size);
  };

  // Handle Language Change
  const handleLanguageChange = (newLanguage: LanguageType) => {
    setLanguage(newLanguage);
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
  }) => {
    return (
      <TouchableOpacity 
        style={styles.radioOption} 
        onPress={() => onSelect(value)}
        activeOpacity={0.7}
      >
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.radioLabel, dynamicStyles.radioLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

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
  }) => {
    return (
      <TouchableOpacity
        style={[styles.iconButtonOption, selected && styles.iconButtonSelected]}
        onPress={() => onSelect(value)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="happy-outline"
          size={selected ? 32 : 24}
          color={selected ? COLORS.primary : COLORS.gray}
        />
        <Text style={[
          styles.iconButtonLabel, 
          dynamicStyles.iconButtonLabel,
          selected && styles.iconButtonLabelSelected
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

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
            <Text style={[styles.avatarText, dynamicStyles.avatarText]}>
              {getInitials(user?.user_name)}
            </Text>
          </View>
          <Text style={[styles.name, dynamicStyles.name]}>
            {user?.user_name || t('profile.title')}
          </Text>
          <Text style={[styles.email, dynamicStyles.email]}>
            {user?.user_email || 'user@email.com'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* --- Accessibility Section --- */}
        <View style={styles.section}>
          {/* TRANSLATED: Section title */}
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            {t('profile.accessibility')}
          </Text>

          {/* Text Size Options */}
          <View style={styles.optionGroup}>
            {/*  TRANSLATED: Option label */}
            <Text style={[styles.optionLabel, dynamicStyles.optionLabel]}>
              {t('profile.textSize')}
            </Text>
            <View style={styles.radioContainer}>
              {/*  TRANSLATED: Size options */}
              <RadioButton
                label={t('profile.small')}
                value="small"
                selected={textSize === 'small'}
                onSelect={handleTextSizeChange}
              />
              <RadioButton
                label={t('profile.medium')}
                value="medium"
                selected={textSize === 'medium'}
                onSelect={handleTextSizeChange}
              />
              <RadioButton
                label={t('profile.large')}
                value="large"
                selected={textSize === 'large'}
                onSelect={handleTextSizeChange}
              />
            </View>
          </View>

          {/* Icon Size Options */}
          <View style={styles.optionGroup}>
            {/* TRANSLATED: Option label */}
            <Text style={[styles.optionLabel, dynamicStyles.optionLabel]}>
              {t('profile.iconSize')}
            </Text>
            <View style={styles.iconButtonContainer}>
              {/* TRANSLATED: Size options */}
              <IconButton
                label={t('profile.default')}
                value="default"
                selected={iconSize === 'default'}
                onSelect={handleIconSizeChange}
              />
              <IconButton
                label={t('profile.medium')}
                value="medium"
                selected={iconSize === 'medium'}
                onSelect={handleIconSizeChange}
              />
              <IconButton
                label={t('profile.large')}
                value="large"
                selected={iconSize === 'large'}
                onSelect={handleIconSizeChange}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- Preferences Section --- */}
        <View style={styles.section}>
          {/* TRANSLATED: Section title */}
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            {t('profile.preferences')}
          </Text>

          {/* Language Options */}
          <View style={styles.optionGroup}>
            {/* TRANSLATED: Option label */}
            <Text style={[styles.optionLabel, dynamicStyles.optionLabel]}>
              {t('profile.language')}
            </Text>
            <View style={styles.languageContainer}>
              {/* TRANSLATED: Language options */}
              <RadioButton
                label={t('profile.english')}
                value="en"
                selected={language === 'en'}
                onSelect={handleLanguageChange}
              />
              <RadioButton
                label={t('profile.maori')}
                value="ma"
                selected={language === 'ma'}
                onSelect={handleLanguageChange}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- Logout Button --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons 
            name="log-out-outline" 
            size={dynamicStyles.logoutIcon} 
            color={COLORS.white} 
            style={{ marginRight: 8 }} 
          />
          {/*  TRANSLATED: Logout text */}
          <Text style={[styles.logoutButtonText, dynamicStyles.logoutButtonText]}>
            {t('profile.logout')}
          </Text>
        </TouchableOpacity>

        {/* Extra padding for scroll */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// --- Styles --- (unchanged)
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
    fontWeight: '700',
    color: '#5A4570',
  },
  name: {
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  email: {
    color: COLORS.gray,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 0,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 20,
  },
  optionGroup: {
    marginBottom: 24,
  },
  optionLabel: {
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 14,
  },
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
    fontWeight: '400',
    color: COLORS.dark,
  },
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
    fontWeight: '500',
    color: COLORS.gray,
  },
  iconButtonLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
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
    fontWeight: '600',
  },
});