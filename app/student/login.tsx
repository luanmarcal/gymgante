import { router, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { Container } from '~/components/Container';
import Header from '~/components/Header';
import { ScreenCenter } from '~/components/ScreenCenter';
import { FIREBASE_AUTH } from '~/utils/firebase';

export default function Login() {
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const passwordInputRef = React.useRef<any>(null);

  const onSignInPress = React.useCallback(async () => {
    try {
      setLoading(true);
      const user = true;
      // const user = await signInWithEmailAndPassword(auth, emailAddress, password);
      if (user) router.navigate('/(tabs)/one');
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [auth, emailAddress, password]);

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
            autoComplete="email"
            autoCorrect={false}
            textContentType="emailAddress"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => {
              passwordInputRef.current?.focus();
            }}
            value={emailAddress}
          />

          <TextInput
            label="Senha"
            mode="outlined"
            style={styles.input}
            secureTextEntry
            onChangeText={setPassword}
            ref={passwordInputRef}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            textContentType="password"
            returnKeyType="done"
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
