import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { ConfiguracaoAcessoRepository, SessaoRepository, UsuarioRepository } from '@/data/repositories';
import { runMigrations } from '@/data/storage';
import { isEmailValido } from '@/domain/security/utils/email';
import { hashSenha } from '@/domain/security/utils/hash';
import LoginCuidadorEdicaoView from "@/screens/views/LoginCuidadorEdicaoView";

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

export default function LoginCuidadorEdicaoScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await runMigrations();
        const sessao = await sessaoRepository.findById(SESSAO_ID);
        if (!sessao?.usuarioNome) return;
        const paciente = await usuarioRepository.findByNome(sessao.usuarioNome);
        if (!paciente) return;
        const cuidador = await usuarioRepository.findByTipoAndPacienteId('cuidador', paciente.id);
        if (cuidador?.email) setEmail(cuidador.email);
      } catch {
        // silencioso
      }
    })();
  }, []);

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
    <LoginCuidadorEdicaoView
      email={email}
      senha={senha}
      loading={loading}
      onChangeEmail={setEmail}
      onChangeSenha={setSenha}
      onAutenticar={autenticarCuidador}
      onResetarSenha={() => navigation.navigate('ResetarSenha')}
    />
  );
}