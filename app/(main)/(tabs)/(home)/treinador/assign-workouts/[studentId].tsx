import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { List, Button, Text } from 'react-native-paper';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';
import { useAppSelector } from '~/redux/store';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AssignWorkoutsToStudent() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams();

  const workouts = useAppSelector(state => state.workout.workouts);
  const exercises = useAppSelector(state => state.workout.exercises);

  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAssigned() {
      if (!studentId || typeof studentId !== 'string') {
        Alert.alert('Erro', 'ID do aluno inválido');
        setLoading(false);
        return;
      }

      try {
        const studentRef = doc(FIREBASE_DB, 'users', studentId);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          const data = studentSnap.data();
          setSelectedWorkouts(Array.isArray(data.assignedWorkouts) ? data.assignedWorkouts : []);
          setSelectedExercises(Array.isArray(data.assignedExercises) ? data.assignedExercises : []);
        }
      } catch (error) {
        console.error('Erro ao carregar atribuições do aluno:', error);
        Alert.alert('Erro', 'Falha ao carregar atribuições do aluno');
      } finally {
        setLoading(false);
      }
    }

    fetchAssigned();
  }, [studentId]);

  const toggleWorkout = (id: string) => {
    setSelectedWorkouts(old =>
      old.includes(id) ? old.filter(w => w !== id) : [...old, id]
    );
  };

  const toggleExercise = (id: string) => {
    setSelectedExercises(old =>
      old.includes(id) ? old.filter(e => e !== id) : [...old, id]
    );
  };

  const assign = async () => {
    if ((!selectedWorkouts || selectedWorkouts.length === 0) &&
        (!selectedExercises || selectedExercises.length === 0)) {
      Alert.alert('Erro', 'Selecione ao menos um treino ou exercício');
      return;
    }

    if (!studentId || typeof studentId !== 'string') {
      Alert.alert('Erro', 'ID do aluno inválido');
      return;
    }

    const studentRef = doc(FIREBASE_DB, 'users', studentId);
    try {
      await updateDoc(studentRef, {
        assignedWorkouts: arrayUnion(...selectedWorkouts),
        assignedExercises: arrayUnion(...selectedExercises),
      });
      Alert.alert('Sucesso', 'Atribuições feitas com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar atribuições');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Carregando atribuições do aluno...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão Voltar para lista de alunos */}
      <Button
        mode="outlined"
        onPress={() => router.push('/treinador/list-alunos')}
        style={{ marginBottom: 16 }}
        icon="arrow-left"
      >
        Voltar para lista de alunos
      </Button>

      <Text style={styles.title}>Selecione treinos</Text>
      <FlatList
        data={workouts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            onPress={() => toggleWorkout(item.id)}
            right={() => (
              <List.Icon
                icon={selectedWorkouts.includes(item.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
              />
            )}
          />
        )}
      />

      <Text style={styles.title}>Selecione exercícios</Text>
      <FlatList
        data={exercises}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            onPress={() => toggleExercise(item.id)}
            right={() => (
              <List.Icon
                icon={selectedExercises.includes(item.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
              />
            )}
          />
        )}
      />

      <Button mode="contained" onPress={assign} style={{ marginTop: 16 }}>
        Salvar atribuições
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', fontSize: 18, marginVertical: 12 },
});
