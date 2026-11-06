import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { autenticarUsuario, getMensagemErro, salvarSessaoAtiva, validaLogin } from '@/domain/services';
import AuthView from "@/screens/views/AuthView";

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const fazerLogin = useCallback(async () => {
    const emailNormalizado = email.trim();
    const senhaNormalizada = senha.trim();

    const validacao = validaLogin(emailNormalizado, senhaNormalizada);
    if (!validacao.valido) {
      Alert.alert(validacao.titulo, validacao.mensagem);
      return;
    }

    setLoading(true);

    try {
      const resultado = await autenticarUsuario(emailNormalizado, senhaNormalizada);

      if (!resultado.sucesso) {
        Alert.alert(resultado.titulo, resultado.mensagem);
        return;
      }

      await salvarSessaoAtiva(resultado.usuario.nome);
      setSenha('');
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha no login', getMensagemErro(erro));
    } finally {
      setLoading(false);
    }
  }, [email, navigation, senha]);

  return (
    <AuthView
      email={email}
      senha={senha}
      loading={loading}
      onChangeEmail={setEmail}
      onChangeSenha={setSenha}
      onLogin={fazerLogin}
      onCriarConta={() => navigation.navigate('CriarConta')}
      onResetarSenha={() => navigation.navigate('ResetarSenha')}
    />
  );
}
