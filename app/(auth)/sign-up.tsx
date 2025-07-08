import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { useAuth } from '~/contexts/auth-context';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(name, email, password); // só 3 argumentos agora
      // navegação ocorre dentro do contexto AuthProvider
    } catch (err: any) {
      const message = err.message || 'Erro ao criar a conta. Tente novamente.';
      setError(message);
      Alert.alert('Erro no Cadastro', message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Criar Conta' }} />
      <Text variant="headlineMedium" style={styles.title}>
        Crie sua conta
      </Text>

      <TextInput
        label="Nome"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
        mode="outlined"
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
      />
      <TextInput
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={handleSignUp}
        loading={loading}
        disabled={loading}
        style={styles.button}>
        Registrar
      </Button>

      <Link href="/(auth)" asChild>
        <Button disabled={loading} style={{ marginTop: 8 }}>
          Já tem uma conta? Faça login
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { textAlign: 'center', marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 8 },
});
