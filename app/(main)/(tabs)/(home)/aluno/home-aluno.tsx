import { View, StyleSheet, Linking, Alert } from 'react-native';
import { Button, Card, Avatar, Text } from 'react-native-paper';
import { useAuth } from '~/contexts/auth-context';
import { useRouter } from 'expo-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

export default function HomeAluno() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [trainerWhatsApp, setTrainerWhatsApp] = useState<string | null>(null);
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

  const handleNavigateToFeedbacks = () => {
    router.push('/(main)/(tabs)/(home)/aluno/feedback-exercicio');
  };

  const handleNavigateToChat = () => {
    router.push('/(main)/(tabs)/(home)/aluno/chat');
  };

  const openWhatsApp = () => {
    if (!trainerWhatsApp) {
      Alert.alert('Erro', 'Número de WhatsApp do treinador não disponível');
      return;
    }
    const phone = trainerWhatsApp.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${phone}`);
  };

  useEffect(() => {
    async function fetchTrainerWhatsApp() {
      try {
        if (!user?.uid) return;
        const alunoRef = doc(FIREBASE_DB, 'users', user.uid);
        const alunoSnap = await getDoc(alunoRef);
        if (!alunoSnap.exists()) return;
        const alunoData = alunoSnap.data();
        console.log('Dados do aluno:', alunoData);
        const trainerCode = alunoData.trainerCode;
        if (!trainerCode) {
          console.log('Aluno não tem trainerCode');
          return;
        }
        const q = query(collection(FIREBASE_DB, 'users'), where('trainerCode', '==', trainerCode));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          console.log('Nenhum treinador encontrado com esse trainerCode');
          return;
        }
        const treinadorDoc = querySnapshot.docs[0];
        const treinadorData = treinadorDoc.data();
        console.log('Dados do treinador:', treinadorData);
        setTrainerWhatsApp(treinadorData.whatsapp);
      } catch (error) {
        console.error('Erro ao buscar número do treinador:', error);
      }
    }

    fetchTrainerWhatsApp();
  }, [user?.uid]);


  return (
    <View style={styles.container}>
      <Card onPress={handleNavigateToTreinos} style={styles.card}>
        <Card.Title
          title="Abrir Treinos"
          titleStyle={styles.cardTitle}
          left={(props) => <Avatar.Icon {...props} size={60} icon="weight-lifter" />}
        />
      </Card>
      <Card style={styles.card}>
        <Card.Title
          title="Comunicação"
          titleStyle={styles.cardTitle}
          left={(props) => <Avatar.Icon {...props} size={60} icon="message" />}
        />
        <Card.Content>
          <Button
            mode="outlined"
            icon="whatsapp"
            onPress={openWhatsApp}
            style={styles.actionButton}
            labelStyle={styles.buttonLabel}
          >
            WhatsApp do Treinador
          </Button>
          <Button
            mode="outlined"
            icon="dumbbell"
            onPress={handleNavigateToFeedbacks}
            style={styles.actionButton}
            labelStyle={styles.buttonLabel}
          >
            Feedbacks
          </Button>
          <Button
            mode="outlined"
            icon="chat-outline"
            onPress={handleNavigateToChat}
            style={styles.actionButton}
            labelStyle={styles.buttonLabel}
          >
            Chat
          </Button>
        </Card.Content>
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
  cardTitle: { fontSize: 25, fontWeight: 'bold', paddingHorizontal: 16 },
  logoutButton: { marginTop: 'auto' },
  actionButton: {
    marginTop: 10,
    borderColor: '#ccc',
  },
  buttonLabel: {
    fontSize: 16,
  },
});
