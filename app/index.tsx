import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { Container } from '~/components/Container';
import Header from '~/components/Header';
import Paragraph from '~/components/Paragraph';
import { ScreenCenter } from '~/components/ScreenCenter';

export default function Welcome() {
  return (
    <Container>
      <ScreenCenter>
        <Header>GymGante</Header>
        <Paragraph>Bem-vindo ao GymGante, o seu aplicativo de acompanhamento de treinos!</Paragraph>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => {
            router.replace('/student/login');
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
