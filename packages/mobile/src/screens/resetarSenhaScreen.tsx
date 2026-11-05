import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { UsuarioRepository } from '@/data/repositories';
import { runMigrations } from '@/data/storage';
import { isEmailValido } from '@/domain/security/email';
import { hashSenha } from '@/domain/security/hash';

const usuarioRepository = new UsuarioRepository();

const SENHA_MINIMA_CARACTERES = 6;

const getMensagemErro = (erro: unknown): string => {
  if (erro instanceof Error && erro.message.trim().length > 0) {
    return erro.message;
  }

  return 'Tente novamente em instantes.';
};

type Props = NativeStackScreenProps<RootStackParamList, 'ResetarSenha'>;

export default function resetarSenhaScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const resetarSenha = useCallback(async () => {
    const emailNormalizado = email.trim();
    const senhaNormalizada = novaSenha.trim();

    if (!emailNormalizado || !senhaNormalizada) {
      Alert.alert('Atenção', 'Informe email e nova senha.');
      return;
    }

    if (!isEmailValido(emailNormalizado)) {
      Alert.alert('Email inválido', 'Informe um email válido.');
      return;
    }

    if (senhaNormalizada.length < SENHA_MINIMA_CARACTERES) {
      Alert.alert('Senha inválida', `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`);
      return;
    }

    setLoading(true);

    try {
      await runMigrations();
      const usuario = await usuarioRepository.findByEmail(emailNormalizado);

      if (!usuario) {
        Alert.alert('Atenção', 'não foi possivel resetar a senha email invalido');
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        return;
      }

      await usuarioRepository.update({
        ...usuario,
        senhaHash: hashSenha(senhaNormalizada),
      });

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

        <Pressable style={styles.button} onPress={resetarSenha} disabled={loading}>
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#26B1A5',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});