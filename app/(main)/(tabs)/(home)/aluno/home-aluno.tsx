import { View, StyleSheet } from 'react-native';
import { Button, Card, Avatar } from 'react-native-paper';
import { useAuth } from '~/contexts/auth-context';
import { useRouter } from 'expo-router';

export default function HomeAluno() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/(auth)'); // rota relativa para login
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const handleNavigateToTreinos = () => {
    router.push('/(main)/(tabs)/(home)/aluno/aluno-workouts'); // navega para a tela AlunoTreinos (ajuste o caminho conforme sua estrutura)
  };

  return (
    <View style={styles.container}>
      <Card onPress={handleNavigateToTreinos} style={styles.card}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 20 },
  card: { paddingVertical: 30 },
  cardTitle: { fontSize: 30, fontWeight: 'bold', paddingHorizontal: 16 },
  logoutButton: { marginTop: 'auto' },
});
