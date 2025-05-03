import { ReactNode } from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

export const Header = (props: { styles?: TextStyle; children: ReactNode }) => {
  return <Text style={[styles.header, props.styles]}>{props.children}</Text>;
};

const styles = StyleSheet.create({
  header: {
    fontSize: 21,
    fontWeight: 'bold',
    paddingVertical: 12,
  },
});
