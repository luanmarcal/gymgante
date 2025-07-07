import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card } from 'react-native-paper';

import { useAuth } from '~/contexts/auth-context';

export default function HomeScreen() {
  const { logout } = useAuth();

  const handleNavigateToExercises = () => {
    // TODO: Implementar a navegação para a tela de exercícios
    console.log('Navegando para exercícios...');
    // router.push('/(main)/exercises');
  };

  const handleSignOut = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // block back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  return (
    <>
      <View style={styles.container}>
        <Card onPress={handleNavigateToExercises} style={styles.card}>
          <Card.Title
            title="Abrir Treinos"
            titleStyle={styles.cardTitle}
            left={(props) => <Avatar.Icon {...props} size={60} icon="weight-lifter" />}
          />
        </Card>

        <Button mode="contained" onPress={handleSignOut} style={styles.logoutButton}>
          Sair
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  card: {
    // Adicionar um preenchimento vertical para aumentar a altura do card
    paddingVertical: 30,
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  debugContainer: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  logoutButton: {
    marginTop: 'auto', // Empurra o botão de sair para o final da tela
  },
});
