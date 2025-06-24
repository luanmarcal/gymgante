import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ScreenContent } from '~/components/screen-content';

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tab Settings' }} />
      <View style={styles.container}>
        <ScreenContent path="/(main)/(tabs)/(settings)/index" title="Tab Settings" />
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
