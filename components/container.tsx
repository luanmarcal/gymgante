import { StyleSheet, SafeAreaView } from 'react-native';

export const Container = ({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: object;
}) => {
  return <SafeAreaView style={{ ...styles.container, ...style }}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
