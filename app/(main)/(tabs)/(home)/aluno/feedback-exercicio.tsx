import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, TextInput, Button, Snackbar, List, Divider } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '~/redux/store';
import { sendFeedback } from '~/redux/slices/feedbacks';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';

type FeedbackTarget = {
  type: 'exercise' | 'workout';
  id: string;
  title: string;
};

type Feedback = {
  id: string;
  comment: string;
  response?: string;
  targetType: 'exercise' | 'workout' | string;
  targetId: string;
  userId: string;
};

export default function FeedbackExercicio() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.userProfile?.uid);
  const assignedWorkouts = useAppSelector((state) => state.workout.workouts);
  const assignedExercises = useAppSelector((state) => state.workout.exercises);
  const userAssignedWorkoutIds = useAppSelector((state) => state.auth.userProfile?.assignedWorkouts || []);
  const userAssignedExerciseIds = useAppSelector((state) => state.auth.userProfile?.assignedExercises || []);
  const myWorkouts = assignedWorkouts.filter((w) => userAssignedWorkoutIds.includes(w.id));
  const myExercises = assignedExercises.filter((e) => userAssignedExerciseIds.includes(e.id));
  const [selectedTarget, setSelectedTarget] = useState<FeedbackTarget | null>(null);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);
  useEffect(() => {
    async function fetchUserFeedbacks() {
      if (!userId) return;
      try {
        const q = query(collection(FIREBASE_DB, 'feedbacks'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const fbList: Feedback[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Feedback),
        }));
        setFeedbacks(fbList);
      } catch (error) {
        console.error('Erro ao buscar feedbacks:', error);
      }
    }
    fetchUserFeedbacks();
  }, [userId, success]);
  const handleSend = async () => {
    if (!comment.trim() || !selectedTarget) return;

    await dispatch(
      sendFeedback({
        userId,
        comment,
        targetId: selectedTarget.id,
        targetType: selectedTarget.type,
      })
    );
    setComment('');
    setSelectedTarget(null);
    setSuccess(true);
  };
  const renderTargetItem = ({ item }: { item: FeedbackTarget }) => (
    <List.Item
      title={item.title}
      left={(props) => <List.Icon {...props} icon={item.type === 'workout' ? 'dumbbell' : 'arm-flex'} />}
      onPress={() => setSelectedTarget(item)}
      style={styles.listItem}
    />
  );

  return (
    <View style={styles.container}>
      {!selectedTarget ? (
        <>
          <Text style={styles.sectionTitle}>Selecione um treino para enviar feedback:</Text>
          <FlatList
            data={myWorkouts.map((w) => ({ type: 'workout', id: w.id, title: w.title }))}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={renderTargetItem}
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
          <Text style={styles.sectionTitle}>Selecione um exercício para enviar feedback:</Text>
          <FlatList
            data={myExercises.map((e) => ({ type: 'exercise', id: e.id, title: e.name }))}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={renderTargetItem}
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
          <Divider style={{ marginVertical: 12 }} />
          <Text style={styles.sectionTitle}>Seus feedbacks enviados:</Text>
          {feedbacks.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 12, color: '#666' }}>
              Nenhum feedback enviado ainda.
            </Text>
          ) : (
            <FlatList
              data={feedbacks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <List.Accordion
                  title={`${item.targetType === 'exercise' ? 'Exercício' : item.targetType === 'workout' ? 'Treino' : 'Outro'} - ${item.comment}`}
                  expanded={expandedFeedbackId === item.id}
                  onPress={() =>
                    setExpandedFeedbackId(expandedFeedbackId === item.id ? null : item.id)
                  }
                >
                  <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Resposta do treinador:</Text>
                    <Text>{item.response || 'Sem resposta ainda.'}</Text>
                  </View>
                </List.Accordion>
              )}
            />
          )}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Feedback para: {selectedTarget.title}</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            placeholder="Escreva seu feedback aqui..."
            style={{ marginBottom: 12 }}
          />
          <Button mode="contained" onPress={handleSend}>
            Enviar Feedback
          </Button>
          <Button onPress={() => setSelectedTarget(null)} style={{ marginTop: 12 }}>
            Voltar para seleção
          </Button>
        </>
      )}
      <Snackbar visible={success} onDismiss={() => setSuccess(false)} duration={2500}>
        Feedback enviado com sucesso!
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  listItem: {
    width: 150,
    marginRight: 12,
    height: 50,
    justifyContent: 'center',
  },
  horizontalList: {
    maxHeight: 60,
    marginBottom: 20,
  },
});

