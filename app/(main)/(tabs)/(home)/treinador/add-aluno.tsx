import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, List, HelperText } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '~/contexts/auth-context';
import { fetchAllStudents, addStudentToTrainer, resetError } from '~/redux/slices/auth';
import { RootState } from '~/redux/store';

export default function AdicionarAluno() {
  const dispatch = useDispatch();
  const { user, userProfile } = useAuth();

  const studentsList = useSelector((state: RootState) => state.auth.studentsList);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const error = useSelector((state: RootState) => state.auth.error);

  useEffect(() => {
    dispatch(fetchAllStudents());
  }, [dispatch]);

  const handleAddStudent = (studentUid: string) => {
    if (!user) return;
    dispatch(addStudentToTrainer({ trainerUid: user.uid, studentUid }));
  };

  const isAlreadyAdded = (studentUid: string) => {
    if (!userProfile?.alunos) return false;
    return userProfile.alunos.includes(studentUid);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Alunos</Text>

      {error.value && (
        <HelperText type="error" visible={true} onPress={() => dispatch(resetError())}>
          {error.message}
        </HelperText>
      )}

      <FlatList
        data={studentsList}
        keyExtractor={(item) => item.uid}
        refreshing={loading}
        onRefresh={() => dispatch(fetchAllStudents())}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={item.email}
            right={() => (
              <Button
                mode="contained"
                disabled={isAlreadyAdded(item.uid) || loading}
                loading={loading && isAlreadyAdded(item.uid) === false}
                onPress={() => handleAddStudent(item.uid)}
              >
                {isAlreadyAdded(item.uid) ? 'Adicionado' : 'Adicionar'}
              </Button>
            )}
          />
        )}
        ListEmptyComponent={
          !loading && <Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhum aluno encontrado.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});
