import { View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Button, Card, Avatar, Text } from 'react-native-paper';
import { useAuth } from '~/contexts/auth-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // ou use o pacote de ícones que preferir

export default function HomeAluno() {
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

  const handleNavigateToTreinos = () => {
    router.push('/(main)/(tabs)/(home)/aluno/aluno-workouts');
  };

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/5581999999999'); // Substitua pelo número real
  };

  const handleNavigateToFeedbacks = () => {
    router.push('/(main)/(tabs)/(home)/aluno/feedback-exercicio');
  };

  const handleNavigateToChat = () => {
    router.push('/(main)/(tabs)/(home)/aluno/chat');
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

      {/* Barra inferior com ícones circulares e texto */}
      <View style={styles.bottomBar}>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconCircle} onPress={openWhatsApp}>
            <MaterialCommunityIcons name="whatsapp" size={28} color="#25D366" />
          </TouchableOpacity>
          <Text style={styles.iconLabel}>WhatsApp</Text>
        </View>

        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconCircle} onPress={handleNavigateToFeedbacks}>
            <MaterialCommunityIcons name="dumbbell" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.iconLabel}>Feedbacks</Text>
        </View>

        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconCircle} onPress={handleNavigateToChat}>
            <MaterialCommunityIcons name="chat-outline" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.iconLabel}>Chat</Text>
        </View>
      </View>

      <Button mode="contained" onPress={handleSignOut} style={styles.logoutButton}>
        Sair
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 20 },
  card: { paddingVertical: 50 },
  cardTitle: { fontSize: 30, fontWeight: 'bold', paddingHorizontal: 16 },
  logoutButton: { marginTop: 'auto' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 30,
    backgroundColor: '#e6e6e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
  alignItems: 'center',
  },
  iconLabel: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
  },
});
