import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n from '../../locales';

export type TextSizeType = 'small' | 'medium' | 'large';
export type IconSizeType = 'default' | 'medium' | 'large';
export type LanguageType = 'en' | 'ma';

interface AccessibilityState {
  textSize: TextSizeType;
  iconSize: IconSizeType;
  language: LanguageType;
  setTextSize: (size: TextSizeType) => void;
  setIconSize: (size: IconSizeType) => void;
  setLanguage: (language: LanguageType) => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      textSize: 'medium',
      iconSize: 'default',
      language: 'en',
      setTextSize: (size) => set({ textSize: size }),
      setIconSize: (size) => set({ iconSize: size }),
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language: language });
      },
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