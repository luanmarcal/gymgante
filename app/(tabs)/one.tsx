import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <View style={styles.container}>
        <ScreenContent path="app/(tabs)/index.tsx" title="Tab One" />
        <Button
          mode="contained"
          onPress={() => {
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
