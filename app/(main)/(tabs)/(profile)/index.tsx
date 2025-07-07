import { Stack, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, StyleSheet, View, Alert } from 'react-native';
import { Avatar, Button, Card, Paragraph, Title } from 'react-native-paper';

import { useAuth } from '~/contexts/auth-context';

export default function ProfileScreen() {
  const { logout, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
    }
  };

  // Bloqueia o botão de voltar no Android para não sair do app
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Perfil' }} />
      <View style={styles.container}>
        {user && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Text
                size={80}
                label={user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                style={styles.avatar}
              />
              <Title style={styles.title}>{user.displayName || 'Usuário'}</Title>
              <Paragraph style={styles.email}>{user.email}</Paragraph>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          onPress={handleSignOut}
          style={styles.button}
          icon="logout-variant">
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
  },
  button: {
    marginTop: 32,
    paddingVertical: 8,
    borderRadius: 30,
  },
});
