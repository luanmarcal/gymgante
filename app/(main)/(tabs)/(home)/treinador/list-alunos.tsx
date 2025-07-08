import React, { useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, List, ActivityIndicator, Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '~/redux/store';
import { fetchAllStudents, removeStudentFromTrainer, fetchUserProfile } from '~/redux/slices/auth';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '~/contexts/auth-context';

export default function TreinadorAlunos() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAuth();
  const userProfile = useAppSelector((state) => state.auth.userProfile);
  const studentsList = useAppSelector((state) => state.auth.studentsList);
  const loading = useAppSelector((state) => state.auth.loading);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        dispatch(fetchUserProfile(user.uid));
      }
      dispatch(fetchAllStudents());
    }, [dispatch, user?.uid])
  );

  const myStudents = useMemo(() => {
    if (!userProfile?.alunos) return [];
    return studentsList.filter((student) => userProfile.alunos.includes(student.uid));
  }, [studentsList, userProfile]);

  const handleRemoveStudent = (studentUid: string) => {
    Alert.alert(
      'Remover Aluno',
      'Tem certeza que deseja remover este aluno da sua turma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            if (!user?.uid) return;
            try {
              await dispatch(removeStudentFromTrainer({ trainerUid: user.uid, studentUid })).unwrap();
              // Atualiza o perfil do treinador para refletir a mudança
              await dispatch(fetchUserProfile(user.uid));
              await dispatch(fetchAllStudents());
            } catch (error) {
              Alert.alert('Erro', 'Falha ao remover aluno.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>Meus alunos: {myStudents.length}</Text>

      {myStudents.length === 0 ? (
        <View style={styles.centered}>
          <Text>Nenhum aluno encontrado na sua turma.</Text>
        </View>
      ) : (
        <FlatList
          data={myStudents}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.container}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.email}
              left={(props) => <List.Icon {...props} icon="account" />}
              right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Button
                    mode="text"
                    compact
                    onPress={() => router.push(`/treinador/feedbacks/${item.uid}`)}
                    disabled={loading}
                  >
                    Feedbacks
                  </Button>
                  <Button
                    mode="text"
                    compact
                    onPress={() => handleRemoveStudent(item.uid)}
                    disabled={loading}
                    color="red"
                  >
                    Remover
                  </Button>
                </View>
              )}
              onPress={() => router.push(`/treinador/assign-workouts/${item.uid}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  container: {
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
