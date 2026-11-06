import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { getMensagemErro, resetarSenha, validaResetarSenha } from '@/domain/services';
import ResetarSenhaView from "@/screens/views/ResetarSenhaView";

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
    <ResetarSenhaView
      email={email}
      novaSenha={novaSenha}
      loading={loading}
      onChangeEmail={setEmail}
      onChangeNovaSenha={setNovaSenha}
      onResetarSenha={handleResetarSenha}
    />
  );
}


