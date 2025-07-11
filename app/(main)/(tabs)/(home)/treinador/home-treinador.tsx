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

  const handleNavigateToViewStudents = () => {
    router.push('/(main)/(tabs)/(home)/treinador/list-alunos');
  };

  const handleNavigateToAddStudents = () => {
    router.push('/(main)/(tabs)/(home)/treinador/add-aluno');
  };

  const handleNavigateToManageWorkouts = () => {
    router.push('/(main)/(tabs)/(home)/treinador/manage-treinos');
  };

  const handleNavigateToFeedbacks = () => {
    router.push('/(main)/(tabs)/(home)/treinador/feedbacks');
  };

  const handleNavigateToChat = () => {
    router.push('/(main)/(tabs)/(home)/treinador/chat');
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
      <Card style={styles.card}>
        <Card.Title
          title="Comunicação"
          titleStyle={styles.cardTitle}
          left={(props) => <Avatar.Icon {...props} size={60} icon="message-text" />}
        />
        <Card.Content style={styles.buttonRow}>
          <Button
            mode="outlined"
            icon="message-reply-text"
            onPress={handleNavigateToFeedbacks}
            style={styles.smallButton}
          >
            Feedbacks
          </Button>
          <Button
            mode="outlined"
            icon="chat"
            onPress={handleNavigateToChat}
            style={styles.smallButton}
          >
            Chat
          </Button>
        </Card.Content>
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
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  card: {
    paddingVertical: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  addButton: {
    marginTop: 8,
  },
  manageButton: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  logoutButton: {
    marginTop: 'auto',
  },
});
