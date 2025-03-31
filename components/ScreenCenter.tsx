import { StyleSheet, View } from 'react-native';

export const ScreenCenter = ({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: object;
}) => {
  return <View style={{ ...styles.container, ...style }}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
