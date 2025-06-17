// import { Stack } from 'expo-router';

// export default function AuthLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="index" options={{ headerShown: false }} />
//     </Stack>
//   );
// }
import { Redirect, Stack } from 'expo-router';

import { useAuth } from '~/contexts/auth-context';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Redirect href="/(main)/(tabs)/(home)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
