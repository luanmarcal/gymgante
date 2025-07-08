import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, List, HelperText } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '~/contexts/auth-context';
import { fetchAllStudents, addStudentToTrainer, resetError, fetchUserProfile } from '~/redux/slices/auth';
import { RootState } from '~/redux/store';

export default function AdicionarAluno() {
  const dispatch = useDispatch();
  const { user, userProfile } = useAuth();

  const studentsList = useSelector((state: RootState) => state.auth.studentsList);
  const globalLoading = useSelector((state: RootState) => state.auth.loading);
  const error = useSelector((state: RootState) => state.auth.error);

  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(fetchAllStudents());
  }, [dispatch]);

  const handleAddStudent = async (studentUid: string) => {
    if (!user) return;

    setLoadingMap((prev) => ({ ...prev, [studentUid]: true }));

    try {
      await dispatch(addStudentToTrainer({ trainerUid: user.uid, studentUid })).unwrap();

      // Marca como adicionado localmente
      setAddedMap((prev) => ({ ...prev, [studentUid]: true }));
    } catch (err) {
      console.error('Erro ao adicionar aluno:', err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [studentUid]: false }));
    }
    await dispatch(fetchUserProfile(user.uid));
  };

  const isAlreadyAdded = (studentUid: string) => {
    return (
      addedMap[studentUid] === true || userProfile?.alunos?.includes(studentUid)
    );
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
        refreshing={globalLoading}
        onRefresh={() => dispatch(fetchAllStudents())}
        renderItem={({ item }) => {
          const isLoading = loadingMap[item.uid] === true;
          const alreadyAdded = isAlreadyAdded(item.uid);

          return (
            <List.Item
              title={item.name}
              description={item.email}
              right={() => (
                <Button
                  mode="contained"
                  disabled={alreadyAdded || isLoading}
                  loading={isLoading}
                  onPress={() => handleAddStudent(item.uid)}
                >
                  {alreadyAdded ? 'Adicionado' : 'Adicionar'}
                </Button>
              )}
            />
          );
        }}
        ListEmptyComponent={
          !globalLoading && <Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhum aluno encontrado.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});
