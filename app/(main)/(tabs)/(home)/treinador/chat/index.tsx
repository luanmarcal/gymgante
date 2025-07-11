import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, List, ActivityIndicator } from 'react-native-paper';
import { FIREBASE_DB } from '~/utils/firebase.client';
import { collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/auth-context';

interface Aluno {
  uid: string;
  name: string;
  email?: string;
}

export default function TrainerAlunoList() {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) return;
    async function fetchAlunosVinculados() {
      setLoading(true);
      try {
        const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          console.warn('Usuário não encontrado');
          setAlunos([]);
          return;
        }
        const trainerCode = userDocSnap.data()?.trainerCode;
        if (!trainerCode) {
          console.warn('TrainerCode não encontrado no documento do usuário');
          setAlunos([]);
          return;
        }
        const usersRef = collection(FIREBASE_DB, 'users');
        const q = query(usersRef, where('trainerCode', '==', trainerCode));
        const querySnapshot = await getDocs(q);
        const alunosVinculados: Aluno[] = querySnapshot.docs
          .filter((docSnap) => docSnap.id !== user.uid)
          .map((docSnap) => ({
            uid: docSnap.id,
            name: docSnap.data().name || 'Sem nome',
            email: docSnap.data().email || '',
          }));
        setAlunos(alunosVinculados);
      } catch (error) {
        console.error('Erro ao buscar alunos vinculados:', error);
        setAlunos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAlunosVinculados();
  }, [user?.uid]);

  const handleOpenChat = (alunoId: string) => {
    router.push(`/(home)/treinador/chat/${alunoId}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (alunos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Nenhum aluno vinculado encontrado.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={alunos}
      keyExtractor={(item) => item.uid}
      renderItem={({ item }) => (
        <List.Item
          title={item.name}
          description={item.email}
          onPress={() => handleOpenChat(item.uid)}
          left={(props) => <List.Icon {...props} icon="account" />}
          style={styles.listItem}
        />
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
