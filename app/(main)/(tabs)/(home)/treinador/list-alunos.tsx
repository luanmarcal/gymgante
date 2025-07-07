import React, { useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, List, ActivityIndicator } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '~/redux/store';
import { fetchAllStudents } from '~/redux/slices/auth';
import { useRouter } from 'expo-router';

export default function TreinadorAlunos() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const userProfile = useAppSelector((state) => state.auth.userProfile);
  const studentsList = useAppSelector((state) => state.auth.studentsList);
  const loading = useAppSelector((state) => state.auth.loading);

  useEffect(() => {
    dispatch(fetchAllStudents());
  }, [dispatch]);

  const myStudents = useMemo(() => {
    if (!userProfile?.alunos) return [];
    return studentsList.filter((student) => userProfile.alunos.includes(student.uid));
  }, [studentsList, userProfile]);

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
