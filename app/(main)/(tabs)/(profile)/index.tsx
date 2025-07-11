import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler, StyleSheet, View, Alert } from 'react-native';
import { Avatar, Button, Card, Paragraph, Title, Text } from 'react-native-paper';
import { useAuth } from '~/contexts/auth-context';
import { useAppDispatch, useAppSelector } from '~/redux/store';
import { fetchUserProfile } from '~/redux/slices/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector((state) => state.auth.userProfile);
  const [trainerName, setTrainerName] = useState<string | null>(null);
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        if (user?.uid) {
          await dispatch(fetchUserProfile(user.uid));
        }
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => subscription.remove();
      }
      loadData();
    }, [user?.uid])
  );

  useFocusEffect(
    useCallback(() => {
      async function fetchTrainerName() {
        if (userProfile?.role === 'aluno' && userProfile.trainerCode) {
          try {
            const q = query(
              collection(FIREBASE_DB, 'users'),
              where('trainerCode', '==', userProfile.trainerCode)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const trainerData = snapshot.docs[0].data();
              setTrainerName(trainerData.name);
            } else {
              setTrainerName(null);
            }
          } catch (error) {
            console.error('Erro ao buscar nome do treinador:', error);
          }
        }
      }

      fetchTrainerName();
    }, [userProfile])
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Perfil' }} />
      <View style={styles.container}>
        {userProfile && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Text
                size={80}
                label={userProfile.name?.charAt(0).toUpperCase() || 'U'}
                style={styles.avatar}
              />
              <Title style={styles.title}>{userProfile.name || 'Usuário'}</Title>
              <Paragraph style={styles.email}>{userProfile.email}</Paragraph>
              <Text>📱 WhatsApp: {userProfile.whatsapp || 'Não informado'}</Text>
              <Text>👤 Tipo: {userProfile.role || 'Não definido'}</Text>
              {userProfile.role === 'aluno' && (
                <Text>🏋️‍♂️ Treinador: {trainerName || 'Não encontrado'}</Text>
              )}
            </Card.Content>
          </Card>
        )}
        <Button
          mode="outlined"
          onPress={() => router.push('/(main)/(tabs)/(profile)/edit-profile')}
          style={styles.button}
          icon="account-edit"
        >
          Editar Perfil
        </Button>
        <Button
          mode="contained"
          onPress={handleSignOut}
          style={styles.button}
          icon="logout-variant"
        >
          Sair da Conta
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  card: {
    borderRadius: 12,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  infoBox: {
    width: '100%',
    marginTop: 12,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  button: {
    marginTop: 32,
    paddingVertical: 8,
    borderRadius: 30,
  },
});
