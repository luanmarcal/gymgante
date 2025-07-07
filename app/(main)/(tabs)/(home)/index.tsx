import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  View,
  TextInput,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RadioButton, HelperText, Button } from 'react-native-paper';
import { useAuth } from '~/contexts/auth-context';
import { useAppDispatch } from '~/redux/store';
import { updateUserProfile, fetchUserProfile } from '~/redux/slices/auth';

import HomeAluno from './aluno/home-aluno';
import HomeTreinador from './treinador/home-treinador';

export default function HomeSelect() {
  const dispatch = useAppDispatch();
  const { user, userProfile } = useAuth();

  const [roleChoice, setRoleChoice] = useState<'aluno' | 'treinador' | null>(null);
  const [trainerCodeInput, setTrainerCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evita voltar para tela anterior
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // Garante que o perfil seja buscado após login
  useEffect(() => {
    if (user?.uid && userProfile === null) {
      dispatch(fetchUserProfile(user.uid));
    }
  }, [user, userProfile]);

  const handleProfileSetup = async () => {
    if (!roleChoice) {
      setError('Por favor, selecione seu tipo de usuário.');
      return;
    }

    if (roleChoice === 'treinador' && !trainerCodeInput.trim()) {
      setError('Por favor, insira o código fixo do treinador.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dispatch(
        updateUserProfile({
          uid: user!.uid,
          role: roleChoice,
          trainerCode: roleChoice === 'treinador' ? trainerCodeInput.trim().toUpperCase() : undefined,
        })
      ).unwrap();

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Aguarda o carregamento do perfil
  if (user?.uid && userProfile === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redireciona para as telas específicas
  if (userProfile?.role === 'aluno') return <HomeAluno />;
  if (userProfile?.role === 'treinador') return <HomeTreinador />;

  // Renderiza seleção de perfil caso não tenha role
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
        Configure seu perfil
      </Text>

      <RadioButton.Group
        onValueChange={(value) => setRoleChoice(value as 'aluno' | 'treinador')}
        value={roleChoice ?? ''}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <RadioButton value="aluno" />
          <Text>Aluno</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <RadioButton value="treinador" />
          <Text>Treinador</Text>
        </View>
      </RadioButton.Group>

      {roleChoice === 'treinador' && (
        <TextInput
          value={trainerCodeInput}
          onChangeText={setTrainerCodeInput}
          style={styles.input}
          autoCapitalize="characters"
          maxLength={6}
          placeholder="Insira o código fixo do treinador"
        />
      )}

      {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}

      <Button
        mode="contained"
        onPress={handleProfileSetup}
        loading={loading}
        disabled={loading}
        style={{ marginTop: 16 }}
      >
        Salvar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
