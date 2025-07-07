import { View, StyleSheet } from 'react-native';
import { Button, Card, Avatar } from 'react-native-paper';
import { useAuth } from '~/contexts/auth-context';
import { useRouter } from 'expo-router';

export default function HomeTreinador() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  // Navega para página que lista os alunos do treinador
  const handleNavigateToViewStudents = () => {
    router.push('/(main)/(tabs)/(home)/treinador/list-alunos');
  };

  const handleNavigateToAddStudents = () => {
    router.push('/(main)/(tabs)/(home)/treinador/add-aluno');
  };

  // NOVO: navega para gerenciar exercícios e treinos
  const handleNavigateToManageWorkouts = () => {
    router.push('/(main)/(tabs)/(home)/treinador/manage-treinos');
  };

  return (
    <View style={styles.container}>
      <Card onPress={handleNavigateToViewStudents} style={styles.card}>
        <Card.Title
          title="Visualizar Alunos"
          titleStyle={styles.cardTitle}
          left={(props) => <Avatar.Icon {...props} size={60} icon="account-group" />}
        />
      </Card>

      <Button
        mode="outlined"
        onPress={handleNavigateToAddStudents}
        style={styles.addButton}
        icon="account-plus"
      >
        Adicionar Alunos
      </Button>

      <Button
        mode="outlined"
        onPress={handleNavigateToManageWorkouts}
        style={styles.manageButton}
        icon="dumbbell"
      >
        Gerenciar Exercícios e Treinos
      </Button>

      <Button mode="contained" onPress={handleSignOut} style={styles.logoutButton}>
        Sair
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 20 },
  card: { paddingVertical: 30 },
  cardTitle: { fontSize: 25, fontWeight: 'bold', paddingHorizontal: 16 },
  addButton: { marginTop: 8 },
  manageButton: { marginTop: 8 },
  logoutButton: { marginTop: 'auto' },
});
