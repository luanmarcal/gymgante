import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, List, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector } from '~/redux/store';

export default function TreinoDetalhe() {
  const { id } = useLocalSearchParams(); // Pega o ID da URL
  const router = useRouter();

  const workouts = useAppSelector(state => state.workout.workouts);
  const exercises = useAppSelector(state => state.workout.exercises);

  if (!id) {
    return (
      <View style={styles.centered}>
        <Text>ID do treino não fornecido.</Text>
      </View>
    );
  }

  // Encontra o treino pelo id
  const treino = workouts.find(w => w.id === id);

  if (!treino) {
    return (
      <View style={styles.centered}>
        <Text>Treino não encontrado.</Text>
      </View>
    );
  }

  // Mapeia os exercícios do treino
  const treinoExercicios = treino.exerciseIds
    .map(exId => exercises.find(e => e.id === exId))
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <Button
        icon="arrow-left"
        mode="outlined"
        onPress={() => router.push('/aluno/aluno-workouts')}
        style={styles.backButton}
      >
        Voltar para Treinos
      </Button>

      <Text style={styles.title}>{treino.title}</Text>
      <Text style={styles.subTitle}>Exercícios:</Text>

      {treinoExercicios.length === 0 ? (
        <Text>Nenhum exercício atribuído a este treino.</Text>
      ) : (
        <FlatList
          data={treinoExercicios}
          keyExtractor={item => item!.id}
          renderItem={({ item }) => (
            <List.Item
              title={item!.name}
              description={item!.description}
              left={props => <List.Icon {...props} icon="arm-flex" />}
              onPress={() => router.push(`/aluno/exercicios/${item!.id}?workoutId=${treino.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  backButton: {
    marginBottom: 12,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  subTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
