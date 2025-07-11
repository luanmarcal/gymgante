import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, List, ActivityIndicator } from 'react-native-paper';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '~/contexts/auth-context';
import { useRouter } from 'expo-router';
import { FIREBASE_DB } from '~/utils/firebase.client';

export default function AllFeedbacks() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

    useEffect(() => {
    async function fetchAllFeedbacks() {
        if (!user) return;
        try {
        const treinadorRef = doc(FIREBASE_DB, 'users', user.uid);
        const treinadorSnap = await getDoc(treinadorRef);
        const data = treinadorSnap.data();
        const alunoIds = Array.isArray(data?.alunos) ? data.alunos : [];
        if (alunoIds.length === 0) {
            setFeedbacks([]);
            setLoading(false);
            return;
        }
        const feedbacksRef = collection(FIREBASE_DB, 'feedbacks');
        const feedbacksQuery = query(feedbacksRef, where('userId', 'in', alunoIds));
        const snapshot = await getDocs(feedbacksQuery);
        const feedbacksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const feedbacksWithNames = await Promise.all(
            feedbacksData.map(async (fb) => {
            if (!fb.userId) return fb;
            const userDoc = await getDoc(doc(FIREBASE_DB, 'users', fb.userId));
            const userData = userDoc.exists() ? userDoc.data() : null;
            return {
                ...fb,
                studentName: userData?.name || 'Aluno desconhecido',
            };
            })
        );
        setFeedbacks(feedbacksWithNames);
        } catch (error) {
        console.error('Erro ao buscar feedbacks:', error);
        } finally {
        setLoading(false);
        }
    }

    fetchAllFeedbacks();
    }, [user]);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Carregando feedbacks...</Text>
      </View>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Nenhum feedback encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={
                item.targetType === 'exercise'
                ? 'Feedback sobre Exercício'
                : item.targetType === 'workout'
                ? 'Feedback sobre Treino'
                : 'Feedback Geral'
            }
            description={`${item.studentName}: ${item.comment}`}
            left={(props) => <List.Icon {...props} icon="message-outline" />}
            onPress={() => {
                router.push({
                pathname: '/treinador/feedbacks/feedbackId/[feedbackId]',
                params: { feedbackId: item.id },
                });
            }}
            />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
