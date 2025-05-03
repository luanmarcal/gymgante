import { router, useFocusEffect } from 'expo-router';
import { BackHandler, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { Container } from '~/components/container';
import { Header } from '~/components/header';
import Paragraph from '~/components/paragraph';
import { ScreenCenter } from '~/components/screen-center';

export default function Welcome() {
  //  close app on back press
  useFocusEffect(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.addEventListener('hardwareBackPress', onBackPress).remove();
  });

  return (
    <Container>
      <ScreenCenter>
        <Header styles={{ marginBottom: 30 }}>Gymgante</Header>
        <Paragraph>Bem-vindo ao Gymgante, o seu aplicativo de acompanhamento de treinos!</Paragraph>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => {
            router.navigate('/student/login');
          }}>
          Sou Aluno
        </Button>
        <Button mode="outlined" style={styles.button} onPress={() => {}}>
          Sou Personal Trainer
        </Button>
      </ScreenCenter>
    </Container>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginTop: 20,
  },
});
