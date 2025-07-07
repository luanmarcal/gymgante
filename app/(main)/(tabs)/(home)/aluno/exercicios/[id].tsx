import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector } from '~/redux/store';

export default function ExercicioDetalhe() {
  const { id, workoutId } = useLocalSearchParams(); // recebendo id do exercício e do treino
  const router = useRouter();

  const exercises = useAppSelector(state => state.workout.exercises);

  if (!id) {
    return (
      <View style={styles.centered}>
        <Text>ID do exercício não fornecido.</Text>
      </View>
    );
  }

  const exercicio = exercises.find(e => e.id === id);

  if (!exercicio) {
    return (
      <View style={styles.centered}>
        <Text>Exercício não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button 
        icon="arrow-left" 
        mode="outlined" 
        onPress={() => {
          if (workoutId && typeof workoutId === 'string') {
            router.push(`/aluno/treinos/${workoutId}`);
          } 
          else {
            router.push('/aluno/aluno-workouts');
          }
        }}
        style={styles.backButton}
      >
        Voltar para Treino
      </Button>

      <Card>
        <Card.Title 
          title={exercicio.name} 
          titleStyle={styles.title} // Aumenta o tamanho do título aqui
        />
        <Card.Content>
          <Text style={styles.description}>
            {exercicio.description || 'Sem descrição disponível.'}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  backButton: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' }, // Estilo maior para o título
  description: { fontSize: 16, marginTop: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
