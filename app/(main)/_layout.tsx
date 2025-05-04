import { Redirect, Stack } from 'expo-router';

// import { useAuth } from '@/contexts/AuthContext';
export default function AppLayout() {
  //   const { isAuthenticated } = useAuth();
  //   if (!isAuthenticated) {
  //     return <Redirect href="/(auth)" />;
  //   }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
