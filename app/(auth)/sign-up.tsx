import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useAuth } from '~/contexts/auth-context';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const isValidWhatsapp = (phone: string) => /^\d{8,15}$/.test(phone);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !whatsapp.trim()) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (!isValidWhatsapp(whatsapp.trim())) {
      setError('Informe um número de WhatsApp válido (apenas dígitos, 8 a 15 caracteres).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log('Registrando usuário:', { name, email, password, whatsapp });
      await register(name, email, password, whatsapp.trim());
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
      <TextInput
        label="WhatsApp (somente números)"
        value={whatsapp}
        onChangeText={setWhatsapp}
        keyboardType="phone-pad"
        style={styles.input}
        mode="outlined"
        maxLength={15}
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
  container: { flex: 1, justifyContent: 'center', padding: 24},
  title: { textAlign: 'center', marginBottom: 24 },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  button: { marginTop: 8, paddingVertical: 8 },
});
