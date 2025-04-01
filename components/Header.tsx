import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function Header(props: React.ComponentProps<typeof Text>) {
  return (
    <Text {...props} style={[styles.header, props.style]}>
      {props.children}
    </Text>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 21,
    fontWeight: 'bold',
    paddingVertical: 12,
  },
});
