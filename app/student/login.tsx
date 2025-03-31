import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { Container } from '~/components/Container';
import { ScreenCenter } from '~/components/ScreenCenter';

export default function Login() {
  return (
    <Container>
      <ScreenCenter style={{ gap: 30 }}>
        {/* Grupo 1 */}
        <View style={{ width: '100%' }}>
          <TextInput label="Email" mode="outlined" style={styles.input} />
          <TextInput label="Senha" mode="outlined" style={styles.input} secureTextEntry />
        </View>

        {/* Grupo 2 */}
        <View style={{ width: '100%' }}>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => {
              router.replace('/(tabs)/one');
            }}>
            Entrar
          </Button>
          <Button mode="outlined" style={styles.button} onPress={() => {}}>
            Criar Conta
          </Button>
          <Button mode="text" style={styles.button} onPress={() => {}}>
            Esqueci minha senha
          </Button>
        </View>
      </ScreenCenter>
    </Container>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
});
