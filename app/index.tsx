// app/index.tsx
import { Redirect } from 'expo-router';

export default function SplashScreen() {
  // For now, this screen will instantly redirect to the login page.
  // Later, we will add logic here to check if the user is already logged in.
  return <Redirect href="/login" />;
}