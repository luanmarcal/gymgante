import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';

import { AuthProvider } from '~/contexts/auth-context';
import store from '~/redux/store';
import { LIGHT_THEME } from '~/utils/constants';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider value={LIGHT_THEME}>
        <AuthProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(main)" />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
                contentStyle: {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                },
              }}
            />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
