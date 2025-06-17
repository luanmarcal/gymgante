import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { ScreenContent } from '~/components/screen-content';
import { useAuth } from '~/contexts/auth-context';
import { increment, decrement, logoutRequest } from '~/redux/slices';
import { useAppDispatch } from '~/redux/store';

export default function HomeScreen() {
  const { logout } = useAuth();

  const count = useSelector((state: any) => state.counter.count);
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    try {
      logout();
      // dispatch(logoutRequest());
      // router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // block back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Tab Home' }} />
      <View style={styles.container}>
        <ScreenContent path="/(main)/(tabs)/(home)" title="Tab Home" />
        <Text>Count: {count}</Text>
        <Button mode="contained" onPress={() => dispatch(increment())}>
          Increment
        </Button>
        <Button mode="contained" onPress={() => dispatch(decrement())}>
          Decrement
        </Button>

        <Button mode="contained" onPress={handleSignOut}>
          Sair
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
