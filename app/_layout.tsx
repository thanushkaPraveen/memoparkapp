// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load any custom fonts you need here
  const [fontsLoaded, error] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'), // Example font
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      // When the fonts are loaded, we can hide the native splash screen
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  // If fonts are not loaded yet, return null. The native splash screen will still be visible.
  if (!fontsLoaded) {
    return null;
  }

  // Once fonts are loaded, render the navigation stack
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}