import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';

import { ScreenContent } from '~/components/screen-content';
import { increment, decrement } from '~/redux/slices/counter';
import { FIREBASE_AUTH } from '~/utils/firebase.client';

export default function Home() {
  const count = useSelector((state: any) => state.counter.count);
  const dispatch = useDispatch();

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
      <Stack.Screen options={{ title: 'Tab One' }} />
      <View style={styles.container}>
        <ScreenContent path="app/(tabs)/index.tsx" title="Tab One" />
        <Text>Count: {count}</Text>
        <Button mode="contained" onPress={() => dispatch(increment())}>
          Increment
        </Button>
        <Button mode="contained" onPress={() => dispatch(decrement())}>
          Decrement
        </Button>

        <Button
          mode="contained"
          onPress={async () => {
            await FIREBASE_AUTH.signOut();
            router.replace('/');
          }}>
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
