import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, List, ActivityIndicator } from 'react-native-paper';
import { useAppSelector } from '~/redux/store';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';
import { useRouter } from 'expo-router';

export default function AlunoTreinos() {
  const router = useRouter();
  const userProfile = useAppSelector(state => state.auth.userProfile);
  const workouts = useAppSelector(state => state.workout.workouts);
  const exercises = useAppSelector(state => state.workout.exercises);

  const [loading, setLoading] = useState<boolean>(true);
  const [assignedWorkouts, setAssignedWorkouts] = useState<string[]>([]);
  const [assignedExercises, setAssignedExercises] = useState<string[]>([]);

  const fetchAssignments = useCallback(async () => {
    if (!userProfile?.uid) {
      setAssignedWorkouts([]);
      setAssignedExercises([]);
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(FIREBASE_DB, 'users', userProfile.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setAssignedWorkouts(Array.isArray(data.assignedWorkouts) ? data.assignedWorkouts : []);
        setAssignedExercises(Array.isArray(data.assignedExercises) ? data.assignedExercises : []);
      } else {
        setAssignedWorkouts([]);
        setAssignedExercises([]);
      }
    } catch (error) {
      console.error('Erro ao buscar atribuições:', error);
      setAssignedWorkouts([]);
      setAssignedExercises([]);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const myWorkouts = workouts.filter(w => assignedWorkouts.includes(w.id));
  const myExercises = exercises.filter(e => assignedExercises.includes(e.id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Treinos</Text>
      {myWorkouts.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum treino atribuído.</Text>
      ) : (
        <FlatList
          data={myWorkouts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.title}
              description={`Exercícios: ${item.exerciseIds.length}`}
              left={props => <List.Icon {...props} icon="dumbbell" />}
              onPress={() => router.push(`/aluno/treinos/${item.id}`)} // Navega para detalhes do treino
            />
            )}
        />
      )}

      <Text style={[styles.title, { marginTop: 20 }]}>Meus Exercícios</Text>
      {myExercises.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum exercício atribuído.</Text>
      ) : (
        <FlatList
          data={myExercises}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.description}
              left={props => <List.Icon {...props} icon="arm-flex" />}
              onPress={() => router.push(`/aluno/exercicios/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  emptyText: { fontSize: 16, fontStyle: 'italic', color: '#666' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
