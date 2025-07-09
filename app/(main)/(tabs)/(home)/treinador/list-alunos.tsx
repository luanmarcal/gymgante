import React, { useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, Linking } from 'react-native';
import { Text, Button, IconButton, ActivityIndicator } from 'react-native-paper';
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

  const openWhatsApp = (phoneRaw?: string) => {
    if (!phoneRaw) {
      Alert.alert('Erro', 'Número de WhatsApp não disponível');
      return;
    }
    const phone = phoneRaw.replace(/[^0-9]/g, ''); // Remove caracteres não numéricos
    Linking.openURL(`https://wa.me/${phone}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    });
  };

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
              // Atualiza perfil e lista após remover
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
            <View style={styles.itemContainer}>
              {/* Ícone WhatsApp à esquerda */}
              <IconButton
                icon="whatsapp"
                color="#25D366"
                size={28}
                onPress={() => openWhatsApp(item.whatsapp)}
                accessibilityLabel={`Abrir WhatsApp de ${item.name}`}
              />

              {/* Nome e email no meio */}
              <View style={styles.infoContainer}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text 
                  style={styles.emailText} 
                  numberOfLines={1} 
                  ellipsizeMode="tail"
                >
                  {item.email}
                </Text>
              </View>

              {/* Botões Feedback e Remover à direita */}
              <View style={styles.actionsContainer}>
                <Button
                  mode="text"
                  compact
                  onPress={() => router.push(`/treinador/feedbacks/${item.uid}`)}
                  disabled={loading}
                >
                  Feedbacks
                </Button>

                <IconButton
                  icon="trash-can-outline"
                  color="red"
                  size={24}
                  onPress={() => handleRemoveStudent(item.uid)}
                  disabled={loading}
                  accessibilityLabel={`Remover aluno ${item.name}`}
                />
              </View>
            </View>
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  nameText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emailText: {
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
