import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '~/contexts/auth-context';
import { doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';
import { updateEmail, updatePassword } from 'firebase/auth';

export default function EditarPerfil() {
  const { user, userProfile } = useAuth();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setWhatsapp(userProfile.whatsapp || '');
      setEmail(user.email || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      if (!user?.uid) return;
      const updates: any = {
        name,
        whatsapp,
      };
      await updateDoc(doc(FIREBASE_DB, 'users', user.uid), updates);
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <TextInput
        label="Nome"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="WhatsApp"
        value={whatsapp}
        onChangeText={setWhatsapp}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Salvar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { marginBottom: 16 },
  button: { marginTop: 12 },
});
