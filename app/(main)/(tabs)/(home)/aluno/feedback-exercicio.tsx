import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Snackbar, List } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '~/redux/store';
import { sendFeedback } from '~/redux/slices/feedbacks';

type FeedbackTarget = {
  type: 'exercise' | 'workout';
  id: string;
  title: string;
};

export default function FeedbackExercicio() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.userProfile?.uid);

  // Buscar treinos e exercícios do usuário
  const assignedWorkouts = useAppSelector((state) => state.workout.workouts);
  const assignedExercises = useAppSelector((state) => state.workout.exercises);
  const userAssignedWorkoutIds = useAppSelector((state) => state.auth.userProfile?.assignedWorkouts || []);
  const userAssignedExerciseIds = useAppSelector((state) => state.auth.userProfile?.assignedExercises || []);

  const myWorkouts = assignedWorkouts.filter((w) => userAssignedWorkoutIds.includes(w.id));
  const myExercises = assignedExercises.filter((e) => userAssignedExerciseIds.includes(e.id));

  // Estado para controlar qual item foi selecionado para feedback
  const [selectedTarget, setSelectedTarget] = useState<FeedbackTarget | null>(null);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!comment.trim() || !selectedTarget) return;

    // Pode adicionar uma lógica para diferenciar treino/exercício no feedback (exemplo abaixo)
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

  return (
    <View style={styles.container}>
      {!selectedTarget ? (
        <>
          <Text style={styles.sectionTitle}>Selecione um treino para enviar feedback:</Text>
          <FlatList
            data={myWorkouts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.title}
                description={`Exercícios: ${item.exerciseIds.length}`}
                left={(props) => <List.Icon {...props} icon="dumbbell" />}
                onPress={() => setSelectedTarget({ type: 'workout', id: item.id, title: item.title })}
              />
            )}
            style={{ marginBottom: 20 }}
          />

          <Text style={styles.sectionTitle}>Selecione um exercício para enviar feedback:</Text>
          <FlatList
            data={myExercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.description}
                left={(props) => <List.Icon {...props} icon="arm-flex" />}
                onPress={() => setSelectedTarget({ type: 'exercise', id: item.id, title: item.name })}
              />
            )}
          />
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
});
