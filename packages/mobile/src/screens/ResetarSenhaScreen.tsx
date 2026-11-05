import React, { useCallback, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { getMensagemErro, resetarSenha, validaResetarSenha } from '@/domain/services';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetarSenha'>;

export default function ResetarSenhaScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetarSenha = useCallback(async () => {
    const emailNormalizado = email.trim();
    const senhaNormalizada = novaSenha.trim();

    const validacao = validaResetarSenha(emailNormalizado, senhaNormalizada);
    if (!validacao.valido) {
      Alert.alert(validacao.titulo, validacao.mensagem);
      return;
    }

    setLoading(true);

    try {
      const resultado = await resetarSenha(emailNormalizado, senhaNormalizada);

      if (!resultado.sucesso) {
        Alert.alert(resultado.titulo, resultado.mensagem);
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        return;
      }

      Alert.alert('Senha atualizada', 'Senha resetada com sucesso.');
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha ao resetar senha', getMensagemErro(erro));
    } finally {
      setLoading(false);
    }
  }, [email, navigation, novaSenha]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../../assets/icon.png')} style={styles.icon} resizeMode="contain" />
        <Text style={styles.title}>resetar senha</Text>

        <TextInput placeholder="email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
        <TextInput
          placeholder="nova senha"
          value={novaSenha}
          onChangeText={setNovaSenha}
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable style={styles.button} onPress={handleResetarSenha} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Resetar senha'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 10,
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#26B1A5',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
