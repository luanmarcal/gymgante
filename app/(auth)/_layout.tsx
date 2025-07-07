import { Redirect, Stack } from 'expo-router';

import { useAuth } from '~/contexts/auth-context';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Redirect href="/(main)/(tabs)/(home)" />;
  }

  // return <Stack screenOptions={{ headerShown: false }} />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
