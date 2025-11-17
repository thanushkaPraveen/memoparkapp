// constants/colors.ts
export const COLOR_THEMES = {
  standard: {
    primary: '#6998E6',  //#3374DB
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    gray: '#8A8A8A',
    dark: '#333333',
    link: '#007BFF',
    inputBorder: '#E0E0E0',
    placeholderText: '#999999',
    error: '#f60000ff',
  },
  highContrast: { 
    primary: '#0000FF',
    white: '#FFFFFF',
    lightGray: '#FFFFFF',
    gray: '#000000',
    dark: '#000000',
    link: '#0000FF',
    inputBorder: '#000000',
    placeholderText: '#000000',
    error: '#FF0000',
  },
  colorBlindFriendly: {
    primary: '#0077BB',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    gray: '#555555',
    dark: '#000000',
    link: '#0077BB',
    inputBorder: '#CCCCCC',
    placeholderText: '#666666',
    error: '#CC6677',
  },
  darkMode: {
    primary: '#8AB4F8',
    white: '#1E1E1E',
    lightGray: '#2D2D2D',
    gray: '#B0B0B0',
    dark: '#E0E0E0',
    link: '#8AB4F8',
    inputBorder: '#555555',
    placeholderText: '#888888',
    error: '#FF6B6B',
  },
};

export type ColorThemeType = keyof typeof COLOR_THEMES;

export const getColors = (theme: ColorThemeType = 'standard') => {
  return COLOR_THEMES[theme];
};

// Keep your original COLORS export for backward compatibility
export const COLORS = COLOR_THEMES.standard;