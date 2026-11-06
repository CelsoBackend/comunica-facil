import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { getMensagemErro, UsuarioService, SessaoService } from '@/domain/services';
import CriarContaView from "@/screens/views/CriarContaView";

const usuarioService = new UsuarioService();
const sessaoService = new SessaoService();

type Props = NativeStackScreenProps<RootStackParamList, 'CriarConta'>;

export default function CriarContaScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCriarConta = useCallback(async () => {
    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim();
    const senhaNormalizada = senha.trim();

    const validacao = usuarioService.validarCriarConta(nomeNormalizado, emailNormalizado, senhaNormalizada);
    if (!validacao.valido) {
      Alert.alert(validacao.titulo, validacao.mensagem);
      return;
    }

    setLoading(true);

    try {
      const resultado = await usuarioService.criarConta(nomeNormalizado, emailNormalizado, senhaNormalizada);

      if (!resultado.sucesso) {
        Alert.alert(resultado.titulo, resultado.mensagem);
        return;
      }

      await sessaoService.encerrarSessao();
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
    <CriarContaView
      nome={nome}
      email={email}
      senha={senha}
      loading={loading}
      onChangeNome={setNome}
      onChangeEmail={setEmail}
      onChangeSenha={setSenha}
      onCriarConta={handleCriarConta}
    />
  );
}
