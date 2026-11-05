import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { ConfiguracaoAcessoRepository, SessaoRepository, UsuarioRepository } from '@/data/repositories';
import { runMigrations } from '@/data/storage';
import { isEmailValido } from '@/domain/security/email';
import { hashSenha } from '@/domain/security/hash';

const usuarioRepository = new UsuarioRepository();
const configuracaoAcessoRepository = new ConfiguracaoAcessoRepository();
const sessaoRepository = new SessaoRepository();

const CONFIGURACAO_ACESSO_ID = 'principal';
const SESSAO_ID = 'principal';

const getMensagemErro = (erro: unknown): string => {
  if (erro instanceof Error && erro.message.trim().length > 0) {
    return erro.message;
  }

  return 'Tente novamente em instantes.';
};

type Props = NativeStackScreenProps<RootStackParamList, 'LoginCuidadorEdicao'>;

export default function loginCuidadorEdicaoScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const autenticarCuidador = useCallback(async () => {
    const emailNormalizado = email.trim();
    const senhaNormalizada = senha.trim();

    if (!emailNormalizado || !senhaNormalizada) {
      Alert.alert('Atenção', 'Informe email e senha do cuidador.');
      return;
    }

    if (!isEmailValido(emailNormalizado)) {
      Alert.alert('Email inválido', 'Informe um email válido.');
      return;
    }

    setLoading(true);
    try {
      await runMigrations();
      const sessao = await sessaoRepository.findById(SESSAO_ID);

      if (!sessao?.usuarioNome) {
        Alert.alert('Sessão inválida', 'Faça login como paciente para continuar.');
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        return;
      }

      const paciente = await usuarioRepository.findByNome(sessao.usuarioNome);
      if (!paciente || paciente.tipo !== 'paciente') {
        Alert.alert('Sessão inválida', 'Faça login como paciente para continuar.');
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        return;
      }

      const cuidador = await usuarioRepository.findByTipoAndPacienteId('cuidador', paciente.id);

      if (!cuidador || cuidador.email !== emailNormalizado || cuidador.senhaHash !== hashSenha(senhaNormalizada)) {
        Alert.alert('Acesso negado', 'Credenciais inválidas do cuidador.');
        return;
      }

      await configuracaoAcessoRepository.save({
        id: CONFIGURACAO_ACESSO_ID,
        modoEdicaoAtivo: true,
        ultimoAcessoCuidadorEm: new Date().toISOString(),
      });

      Alert.alert('Modo edição ativo', 'Acesso do cuidador liberado para gestão.');
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha ao autenticar cuidador', getMensagemErro(erro));
    } finally {
      setLoading(false);
    }
  }, [email, navigation, senha]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>login cuidador</Text>

        <TextInput placeholder="email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
        <TextInput
          placeholder="senha"
          value={senha}
          onChangeText={setSenha}
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable style={styles.button} onPress={autenticarCuidador} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Entrar no modo edição'}</Text>
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