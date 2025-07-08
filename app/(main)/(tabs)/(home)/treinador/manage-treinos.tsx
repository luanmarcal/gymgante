import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TextInput, Alert } from 'react-native';
import { Button, Card, List, IconButton } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '~/redux/store';
import {
  fetchExercises,
  addExercise,
  deleteExercise,
  updateExercise,
  fetchWorkouts,
  addWorkout,
  deleteWorkout,
  updateWorkout,
} from '~/redux/slices/workouts';

export default function ManageTreinos() {
  const dispatch = useAppDispatch();

  const [tab, setTab] = useState<'exercises' | 'workouts'>('exercises');

  const exercises = useAppSelector((state) => state.workout.exercises);
  const workouts = useAppSelector((state) => state.workout.workouts);

  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchExercises());
    dispatch(fetchWorkouts());
  }, [dispatch]);

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Erro', 'Nome do exercício é obrigatório.');
      return;
    }

    if (editingExerciseId) {
      dispatch(
        updateExercise({
          id: editingExerciseId,
          data: {
            name: newExerciseName,
            description: newExerciseDescription,
          },
        })
      );
    } else {
      dispatch(addExercise({ name: newExerciseName, description: newExerciseDescription }));
    }

    setNewExerciseName('');
    setNewExerciseDescription('');
    setEditingExerciseId(null);
  };

  const handleDeleteExercise = (id: string) => {
    Alert.alert('Confirmar', 'Deseja excluir este exercício?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', onPress: () => dispatch(deleteExercise(id)) },
    ]);
  };

  const handleEditExercise = (id: string) => {
    const ex = exercises.find((e) => e.id === id);
    if (ex) {
      setNewExerciseName(ex.name);
      setNewExerciseDescription(ex.description);
      setEditingExerciseId(id);
    }
  };

  const handleAddWorkout = () => {
    if (!newWorkoutTitle.trim()) {
      Alert.alert('Erro', 'Título do treino é obrigatório.');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Erro', 'Selecione ao menos um exercício.');
      return;
    }

    if (editingWorkoutId) {
      dispatch(
        updateWorkout({
          id: editingWorkoutId,
          data: {
            title: newWorkoutTitle,
            exerciseIds: selectedExercises,
          },
        })
      );
    } else {
      dispatch(addWorkout({ title: newWorkoutTitle, exerciseIds: selectedExercises }));
    }

    setNewWorkoutTitle('');
    setSelectedExercises([]);
    setEditingWorkoutId(null);
  };

  const handleDeleteWorkout = (id: string) => {
    Alert.alert('Confirmar', 'Deseja excluir este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', onPress: () => dispatch(deleteWorkout(id)) },
    ]);
  };

  const handleEditWorkout = (id: string) => {
    const workout = workouts.find((w) => w.id === id);
    if (workout) {
      setNewWorkoutTitle(workout.title);
      setSelectedExercises(workout.exerciseIds);
      setEditingWorkoutId(id);
    }
  };

  const toggleExerciseSelection = (id: string) => {
    if (selectedExercises.includes(id)) {
      setSelectedExercises(selectedExercises.filter((e) => e !== id));
    } else {
      setSelectedExercises([...selectedExercises, id]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabButtons}>
        <Button
          mode={tab === 'exercises' ? 'contained' : 'outlined'}
          onPress={() => setTab('exercises')}
          style={styles.tabButton}
        >
          Exercícios
        </Button>
        <Button
          mode={tab === 'workouts' ? 'contained' : 'outlined'}
          onPress={() => setTab('workouts')}
          style={styles.tabButton}
        >
          Treinos
        </Button>
      </View>

      {tab === 'exercises' && (
        <View style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>{editingExerciseId ? 'Editar Exercício' : 'Adicionar Novo Exercício'}</Text>
            <TextInput
              placeholder="Nome do exercício"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              style={styles.input}
            />
            <TextInput
              placeholder="Descrição"
              value={newExerciseDescription}
              onChangeText={setNewExerciseDescription}
              style={[styles.input, { height: 80 }]}
              multiline
            />
            <Button
              mode="contained"
              onPress={handleAddExercise}
              style={{ alignSelf: 'center', minWidth: 150 }}
            >
              {editingExerciseId ? 'Salvar Edição' : 'Adicionar Exercício'}
            </Button>
          </View>

          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            style={{ flex: 1, marginTop: 16 }}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.description}
                right={() => (
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="pencil" onPress={() => handleEditExercise(item.id)} />
                    <IconButton icon="delete" onPress={() => handleDeleteExercise(item.id)} />
                  </View>
                )}
              />
            )}
          />
        </View>
      )}

      {tab === 'workouts' && (
        <View style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>{editingWorkoutId ? 'Editar Treino' : 'Criar Novo Treino'}</Text>
            <TextInput
              placeholder="Título do treino"
              value={newWorkoutTitle}
              onChangeText={setNewWorkoutTitle}
              style={styles.input}
            />
            <Text style={{ marginVertical: 8, alignSelf: 'flex-start' }}>Selecione exercícios:</Text>
            <FlatList
              data={exercises}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 150 }}
              renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                  description={item.description}
                  onPress={() => toggleExerciseSelection(item.id)}
                  right={() => (
                    <List.Icon
                      icon={selectedExercises.includes(item.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    />
                  )}
                />
              )}
            />
            <Button
              mode="contained"
              onPress={handleAddWorkout}
              style={{ alignSelf: 'center', marginTop: 12, minWidth: 150 }}
            >
              {editingWorkoutId ? 'Salvar Edição' : 'Criar Treino'}
            </Button>
          </View>

          <FlatList
            data={workouts}
            keyExtractor={(item) => item.id}
            style={{ flex: 1, marginTop: 16 }}
            renderItem={({ item }) => (
              <Card style={{ marginBottom: 8, padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                    <Text>
                      Exercícios:{' '}
                      {item.exerciseIds
                        .map((id) => {
                          const ex = exercises.find((e) => e.id === id);
                          return ex ? ex.name : '';
                        })
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="pencil" onPress={() => handleEditWorkout(item.id)} />
                    <IconButton icon="delete" onPress={() => handleDeleteWorkout(item.id)} />
                  </View>
                </View>
              </Card>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  tabButtons: { flexDirection: 'row', marginBottom: 12 },
  tabButton: { flex: 1, marginHorizontal: 4 },
  content: { flex: 1 },
  formContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 8, alignSelf: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
});
