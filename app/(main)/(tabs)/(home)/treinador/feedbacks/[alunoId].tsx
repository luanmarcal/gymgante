import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, List, ActivityIndicator, Button } from 'react-native-paper'; // Adicionado Button
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';

export default function FeedbacksDoAluno() {
  console.log('FeedbacksDoAluno component rendered');
  const { alunoId } = useLocalSearchParams();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeedbacks() {
      if (!alunoId || typeof alunoId !== 'string') {
        setLoading(false);
        console.warn('alunoId is missing or invalid.');
        return;
      }

      setLoading(true);
      try {
        const feedbacksRef = collection(FIREBASE_DB, 'feedbacks');
        const q = query(feedbacksRef, where('userId', '==', alunoId));
        const snapshot = await getDocs(q);

        const feedbackList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeedbacks(feedbackList);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeedbacks();
  }, [alunoId]);

  const handleGoBack = () => {
    router.push('/treinador/list-alunos');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color="blue" size="large" />
        <Text style={styles.loadingText}>Carregando feedbacks...</Text>
      </View>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <View style={styles.container}>
        <Button mode="outlined" onPress={handleGoBack} style={styles.backButton}>
          ← Voltar para Alunos
        </Button>
        <Text style={styles.noFeedbacksText}>Nenhum feedback encontrado para este aluno.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button mode="outlined" onPress={handleGoBack} style={styles.backButton}>
        ← Voltar para Alunos
      </Button>
      <Text style={styles.title}>Feedbacks do Aluno</Text>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={
              item.targetType === 'exercise'
                ? `Feedback sobre Exercício`
                : item.targetType === 'workout'
                ? `Feedback sobre Treino`
                : 'Feedback Geral'
            }
            description={item.comment}
            left={(props) => <List.Icon {...props} icon="message-text-outline" />}
            onPress={() => {
              console.log('Navigating to feedbackId:', item.id);
              router.push({
                pathname: '/treinador/feedbacks/feedbackId/[feedbackId]',
                params: { feedbackId: item.id, alunoId: alunoId },
              });
            }}
            style={styles.listItem}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  noFeedbacksText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
});
