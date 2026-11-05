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

const SENHA_MINIMA_CARACTERES = 6;
const SESSAO_ID = 'principal';

const criarId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getMensagemErro = (erro: unknown): string => {
  if (erro instanceof Error && erro.message.trim().length > 0) {
    return erro.message;
  }

  return 'Tente novamente em instantes.';
};

type Props = NativeStackScreenProps<RootStackParamList, 'CriarConta'>;

export default function criarContaScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const criarConta = useCallback(async () => {
    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim();
    const senhaNormalizada = senha.trim();

    if (!nomeNormalizado || !emailNormalizado || !senhaNormalizada) {
      Alert.alert('Atenção', 'Informe nome, email e senha para criar conta.');
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
      const usuarioExistente = await usuarioRepository.findByEmail(emailNormalizado);

      if (usuarioExistente) {
        Alert.alert('Conta existente', 'Já existe uma conta cadastrada com este email.');
        return;
      }

      await usuarioRepository.create({
        id: criarId(),
        nome: nomeNormalizado,
        email: emailNormalizado,
        senhaHash: hashSenha(senhaNormalizada),
        tipo: 'paciente',
        criadoEm: new Date().toISOString(),
      });

      const agora = new Date().toISOString();
      const sessaoExistente = await sessaoRepository.findById(SESSAO_ID);

      await sessaoRepository.save({
        id: SESSAO_ID,
        ativa: false,
        usuarioNome: null,
        criadoEm: sessaoExistente?.criadoEm ?? agora,
        atualizadoEm: agora,
      });

      Alert.alert('Conta criada', 'Conta criada com sucesso.');
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha ao criar conta', getMensagemErro(erro));
    } finally {
      setLoading(false);
    }
  }, [email, navigation, nome, senha]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>criar conta</Text>

        <TextInput placeholder="nome" value={nome} onChangeText={setNome} style={styles.input} autoCapitalize="words" />
        <TextInput placeholder="email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
        <TextInput
          placeholder="senha"
          value={senha}
          onChangeText={setSenha}
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable style={styles.button} onPress={criarConta} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Criar conta'}</Text>
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