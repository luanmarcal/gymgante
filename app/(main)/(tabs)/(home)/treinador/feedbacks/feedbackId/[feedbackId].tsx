import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';
import { useAppDispatch, useAppSelector } from '~/redux/store';
import { fetchExercises, fetchWorkouts } from '~/redux/slices/workouts';

export default function FeedbackDetails() {
  const { feedbackId, alunoId } = useLocalSearchParams();
  const router = useRouter();

  const workouts = useAppSelector((state) => state.workout.workouts);
  const exercises = useAppSelector((state) => state.workout.exercises);

  const [feedback, setFeedback] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchWorkouts());
    dispatch(fetchExercises());

    const fetchFeedback = async () => {
      if (!feedbackId) {
        setLoading(false);
        console.warn('feedbackId is missing or invalid.');
        return;
      }
      try {
        const ref = doc(FIREBASE_DB, 'feedbacks', String(feedbackId));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setFeedback(data);
          setResponse(data.response || '');
        } else {
          console.warn(`Feedback with ID ${feedbackId} not found.`);
          setFeedback(null);
        }
      } catch (err) {
        console.error('Erro ao buscar feedback:', err);
        setFeedback(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [feedbackId]);

  const handleRespond = async () => {
    if (!feedbackId) {
      console.warn('Cannot respond: feedbackId is missing.');
      return;
    }

    try {
      await updateDoc(doc(FIREBASE_DB, 'feedbacks', String(feedbackId)), {
        response,
      });
      console.log('Resposta enviada com sucesso!');
      router.back();
    } catch (err) {
      console.error('Erro ao responder feedback:', err);
    }
  };

  // NOVO: função para voltar para a página do aluno
  const handleGoBackToAluno = () => {
    if (alunoId) {
      router.push(`/treinador/feedbacks/${alunoId}`); // Ajuste a rota conforme sua estrutura real
    } else {
      router.push('/treinador/feedbacks'); // fallback para voltar à página anterior
    }
  };

  if (loading || !feedback) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color='blue' size="large" />
        <Text style={styles.loading}>Carregando feedback...</Text>
      </View>
    );
  }

  const targetName =
    feedback.targetType === 'exercise'
      ? exercises.find((e) => e.id === feedback.targetId)?.name
      : workouts.find((w) => w.id === feedback.targetId)?.title;

  return (
    <View style={styles.container}>
      {/* Botão voltar para aluno */}
      <Button mode="outlined" onPress={handleGoBackToAluno} style={styles.backButton}>
        ← Voltar
      </Button>

      <Text style={styles.label}>Referente a:</Text>
      <Text style={styles.title}>{targetName || 'Desconhecido'}</Text>

      <Divider style={styles.divider} />

      <Text style={styles.label}>Comentário do aluno:</Text>
      <Text style={styles.comment}>{feedback.comment}</Text>

      <Divider style={styles.divider} />

      <Text style={styles.label}>Resposta do treinador:</Text>
      <TextInput
        mode="outlined"
        placeholder="Digite sua resposta aqui..."
        value={response}
        onChangeText={setResponse}
        multiline
        style={styles.textInput}
      />

      <Button mode="contained" onPress={handleRespond} style={styles.button}>
        Enviar resposta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loading: {
    padding: 20,
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
  },
  backButton: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    color: '#000',
  },
  comment: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    lineHeight: 24,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#ccc',
  },
  textInput: {
    marginBottom: 10,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
