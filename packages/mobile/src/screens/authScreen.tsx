import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { SessaoRepository, UsuarioRepository } from '@/data/repositories';
import { runMigrations } from '@/data/storage';
import { isEmailValido } from '@/domain/security/email';
import { hashSenha } from '@/domain/security/hash';

const usuarioRepository = new UsuarioRepository();
const sessaoRepository = new SessaoRepository();

const SESSAO_ID = 'principal';

const getMensagemErro = (erro: unknown): string => {
  if (erro instanceof Error && erro.message.trim().length > 0) {
    return erro.message;
  }

  return 'Tente novamente em instantes.';
};

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const salvarSessaoAtiva = useCallback(async (usuarioNome: string) => {
    const agora = new Date().toISOString();
    const sessaoExistente = await sessaoRepository.findById(SESSAO_ID);

    await sessaoRepository.save({
      id: SESSAO_ID,
      ativa: true,
      usuarioNome,
      criadoEm: sessaoExistente?.criadoEm ?? agora,
      atualizadoEm: agora,
    });
  }, []);

  const fazerLogin = useCallback(async () => {
    const emailNormalizado = email.trim();
    const senhaNormalizada = senha.trim();

    if (!emailNormalizado || !senhaNormalizada) {
      Alert.alert('Atenção', 'Informe email e senha.');
      return;
    }

    if (!isEmailValido(emailNormalizado)) {
      Alert.alert('Email inválido', 'Informe um email válido.');
      return;
    }

    setLoading(true);

    try {
      await runMigrations();
      const usuario = await usuarioRepository.findByEmail(emailNormalizado);

      if (!usuario || usuario.senhaHash !== hashSenha(senhaNormalizada)) {
        Alert.alert('Acesso negado', 'Credenciais inválidas.');
        return;
      }

      if (usuario.tipo !== 'paciente') {
        Alert.alert('Acesso negado', 'Use o login do paciente para acessar a Home.');
        return;
      }

      await salvarSessaoAtiva(usuario.nome);
      setSenha('');
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha no login', getMensagemErro(erro));
    } finally {
      setLoading(false);
    }
  }, [email, navigation, salvarSessaoAtiva, senha]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>login</Text>

        <TextInput placeholder="email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
        <TextInput
          placeholder="senha"
          value={senha}
          onChangeText={setSenha}
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable style={styles.button} onPress={fazerLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Login'}</Text>
        </Pressable>

        <Pressable style={styles.buttonSecondary} onPress={() => navigation.navigate('CriarConta')} disabled={loading}>
          <Text style={styles.buttonSecondaryText}>Criar conta</Text>
        </Pressable>

        <Pressable style={styles.buttonSecondary} onPress={() => navigation.navigate('ResetarSenha')} disabled={loading}>
          <Text style={styles.buttonSecondaryText}>Resetar senha</Text>
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
    backgroundColor: '#0b3a8f',
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
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#0b3a8f',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#0b3a8f',
    fontWeight: '600',
    fontSize: 16,
  },
});
