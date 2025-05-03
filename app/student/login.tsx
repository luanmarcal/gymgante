import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { Container } from '~/components/container';
import { Header } from '~/components/header';
import { LoadingIndicator } from '~/components/loading-indicator';
import { ScreenCenter } from '~/components/screen-center';
import { FIREBASE_AUTH } from '~/utils/firebase';

export default function Login() {
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = useCallback(async () => {
    try {
      setLoading(true);
      // const user = true;
      const user = await signInWithEmailAndPassword(auth, emailAddress, password);
      if (user) router.replace('/(tabs)/one');
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [auth, emailAddress, password]);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <Container>
      <ScreenCenter style={{ gap: 30 }}>
        <Header>Login</Header>

        <View style={{ width: '100%' }}>
          <TextInput
            label="Email"
            mode="outlined"
            style={styles.input}
            onChangeText={setEmailAddress}
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailAddress}
          />

          <TextInput
            label="Senha"
            mode="outlined"
            style={styles.input}
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
        </View>

        <View style={{ width: '100%' }}>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => {
              onSignInPress();
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
