// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuthStore } from '../features/auth/store';

export default function SplashScreen() {

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return <Redirect href={isAuthenticated ? '/home' : '/login'} />;
}