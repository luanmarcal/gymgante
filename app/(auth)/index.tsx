import { useState, useCallback, useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { Container } from '~/components/container';
import { Header } from '~/components/header';
import { LoadingIndicator } from '~/components/loading-indicator';
import { ScreenCenter } from '~/components/screen-center';
import { useAuth } from '~/contexts/auth-context';
import { loginRequest, resetError } from '~/redux/slices';
import { useAppDispatch, useAppSelector } from '~/redux/store';

export default function Login() {
  const { login } = useAuth();

  // const router = useRouter();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error.value) {
      Alert.alert('Erro ao fazer login', error.message);
      dispatch(resetError());
    }
  }, [error]);

  const onSignInPress = useCallback(async () => {
    try {
      login(emailAddress, password);
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [emailAddress, password]);

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
