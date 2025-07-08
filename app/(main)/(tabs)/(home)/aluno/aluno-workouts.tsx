import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Text, List, ActivityIndicator, Checkbox, Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '~/redux/store';
import { fetchExercises, fetchWorkouts } from '~/redux/slices/workouts';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function AlunoTreinos() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const userProfile = useAppSelector((state) => state.auth.userProfile);
  const workouts = useAppSelector((state) => state.workout.workouts);
  const exercises = useAppSelector((state) => state.workout.exercises);

  const [loading, setLoading] = useState(true);
  const [assignedWorkouts, setAssignedWorkouts] = useState<string[]>([]);
  const [assignedExercises, setAssignedExercises] = useState<string[]>([]);

  // Calendário semanal
  const [weekAssignments, setWeekAssignments] = useState<
    Record<
      string,
      {
        workouts: string[];
        completed: Record<string, boolean>;
      }
    >
  >({});
  const [selectedDay, setSelectedDay] = useState(WEEK_DAYS[0]);

  // Buscar atribuições e calendário semanal
  const fetchAssignments = useCallback(async () => {
    if (!userProfile?.uid) {
      setAssignedWorkouts([]);
      setAssignedExercises([]);
      setWeekAssignments({});
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

        if (data.weekAssignments) {
          setWeekAssignments(data.weekAssignments);
        } else {
          const emptyWeek = WEEK_DAYS.reduce((acc, day) => {
            acc[day] = { workouts: [], completed: {} };
            return acc;
          }, {} as Record<string, { workouts: string[]; completed: Record<string, boolean> }>);
          setWeekAssignments(emptyWeek);
        }
      } else {
        setAssignedWorkouts([]);
        setAssignedExercises([]);
        setWeekAssignments({});
      }
    } catch (error) {
      console.error('Erro ao buscar atribuições:', error);
      setAssignedWorkouts([]);
      setAssignedExercises([]);
      setWeekAssignments({});
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    const todayIndex = new Date().getDay();
    const mapping = [6, 0, 1, 2, 3, 4, 5];
    setSelectedDay(WEEK_DAYS[mapping[todayIndex]]);
    fetchAssignments();
    dispatch(fetchWorkouts());
    dispatch(fetchExercises());
  }, [fetchAssignments]);

  const myWorkouts = workouts.filter((w) => assignedWorkouts.includes(w.id));
  const myExercises = exercises.filter((e) => assignedExercises.includes(e.id));

  // Salvar calendário semanal no Firestore
  const saveWeekAssignments = async (newAssignments: typeof weekAssignments) => {
    if (!userProfile?.uid) return;

    setWeekAssignments(newAssignments);

    try {
      const userRef = doc(FIREBASE_DB, 'users', userProfile.uid);
      await updateDoc(userRef, {
        weekAssignments: newAssignments,
      });
    } catch (error) {
      console.error('Erro ao salvar calendário semanal:', error);
    }
  };

  // Toggle treino no dia selecionado
  const toggleWorkoutInDay = (workoutId: string) => {
    const dayData = weekAssignments[selectedDay] || { workouts: [], completed: {} };
    let newWorkouts: string[];
    let newCompleted = { ...dayData.completed };

    if (dayData.workouts.includes(workoutId)) {
      newWorkouts = dayData.workouts.filter((id) => id !== workoutId);
      delete newCompleted[workoutId];
    } else {
      newWorkouts = [...dayData.workouts, workoutId];
      newCompleted[workoutId] = false;
    }

    const newAssignments = {
      ...weekAssignments,
      [selectedDay]: { workouts: newWorkouts, completed: newCompleted },
    };
    saveWeekAssignments(newAssignments);
  };


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const dayData = weekAssignments[selectedDay] || { workouts: [], completed: {} };

  return (
    <ScrollView style={styles.container}>
      {/* Meus Treinos - horizontal */}
      <Text style={styles.title}>Meus Treinos</Text>
      {myWorkouts.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum treino atribuído.</Text>
      ) : (
        <FlatList
          data={myWorkouts}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContainer}
          renderItem={({ item }) => (
            <List.Item
              title={item.title}
              description={`Exercícios: ${item.exerciseIds.length}`}
              left={(props) => <List.Icon {...props} icon="dumbbell" />}
              style={styles.horizontalItem}
              onPress={() => router.push(`/aluno/treinos/${item.id}`)}
            />
          )}
        />
      )}

      {/* Meus Exercícios - horizontal */}
      <Text style={[styles.title, { marginTop: 20 }]}>Meus Exercícios</Text>
      {myExercises.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum exercício atribuído.</Text>
      ) : (
        <FlatList
          data={myExercises}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContainer}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.description}
              left={(props) => <List.Icon {...props} icon="arm-flex" />}
              style={styles.horizontalItem}
              onPress={() => router.push(`/aluno/exercicios/${item.id}`)}
            />
          )}
        />
      )}

      {/* Calendário semanal */}
      <View style={{ marginTop: 30 }}>
        <Text style={styles.title}>Calendário Semanal</Text>

        {/* Seleção de dia da semana */}
        <View style={styles.weekContainer}>
          {WEEK_DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayButton,
                selectedDay === day && styles.dayButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDay === day && styles.dayTextSelected,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Treinos do dia */}
        {dayData.workouts.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum treino atribuído para este dia.</Text>
        ) : (
          <FlatList
            data={dayData.workouts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(workoutId) => workoutId}
            contentContainerStyle={styles.horizontalListContainer}
            renderItem={({ item: workoutId }) => {
              const workout = myWorkouts.find((w) => w.id === workoutId);
              if (!workout) return null;

              return (
                <List.Item
                  key={workout.id}
                  title={workout.title}
                  description={`Exercícios: ${workout.exerciseIds.length}`}
                  style={styles.workoutItem}
                  onPress={() => router.push(`/aluno/treinos/${workout.id}`)}
                />
              );
            }}
          />
        )}


        {/* Adicionar treinos ao dia */}
        <Text style={[styles.title, { marginTop: 20 }]}>Adicionar treinos ao dia</Text>
        {myWorkouts.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum treino disponível.</Text>
        ) : (
          <FlatList
            data={myWorkouts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalListContainer}
            renderItem={({ item }) => {
              const isAdded = dayData.workouts.includes(item.id);
              return (
                <List.Item
                  title={item.title}
                  description={`Exercícios: ${item.exerciseIds.length}`}
                  style={[
                    styles.workoutItem,
                    isAdded && { backgroundColor: '#cce5ff' } // Exemplo visual para treino adicionado
                  ]}
                  left={(props) => <List.Icon {...props} icon="dumbbell" />}
                  onPress={() => toggleWorkoutInDay(item.id)} // o item inteiro é clicável
                />
              );
            }}
          />
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 12 },
  emptyText: { fontSize: 16, fontStyle: 'italic', color: '#666', marginVertical: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  weekContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  dayButtonSelected: {
    backgroundColor: '#6200ee',
  },
  dayText: {
    fontWeight: 'bold',
    color: '#333',
  },
  dayTextSelected: {
    color: 'white',
  },
  horizontalListContainer: {
    paddingLeft: 16,
  },
  horizontalItem: {
    width: 170,
    marginRight: 12,
  },
  workoutItem: {
    width: 200,
    marginRight: 12,
  },
});
