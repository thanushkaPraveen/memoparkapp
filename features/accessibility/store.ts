//store.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getColors } from '../../constants/colors';
import i18n from '../../locales';

export type TextSizeType = 'small' | 'medium' | 'large';
export type IconSizeType = 'default' | 'medium' | 'large';
export type LanguageType = 'en' | 'ma';
export type ColorThemeType = 'standard' | 'highContrast' | 'colorBlindFriendly' | 'darkMode';


interface AccessibilityState {
  textSize: TextSizeType;
  iconSize: IconSizeType;
  language: LanguageType;
  colorTheme: ColorThemeType;
  setTextSize: (size: TextSizeType) => void;
  setIconSize: (size: IconSizeType) => void;
  setLanguage: (language: LanguageType) => void;
  setColorTheme: (theme: ColorThemeType) => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      textSize: 'medium',
      iconSize: 'default',
      language: 'en',
      colorTheme: 'standard',
      setTextSize: (size) => set({ textSize: size }),
      setIconSize: (size) => set({ iconSize: size }),
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language: language });
      },
      setColorTheme: (theme) => set({ colorTheme: theme }),
    }),
    {
      name: 'accessibility-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);

export const useThemeColors = () => {
  const colorTheme = useAccessibilityStore((state) => state.colorTheme);
  return getColors(colorTheme);
};