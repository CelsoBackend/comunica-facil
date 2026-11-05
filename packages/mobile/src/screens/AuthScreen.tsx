import React, { useCallback, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import { autenticarUsuario, getMensagemErro, salvarSessaoAtiva, validaLogin } from '@/domain/services';

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
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../../assets/icon.png')} style={styles.icon} resizeMode="contain" />
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
          <Text style={styles.buttonSecondaryText}>Criar Conta</Text>
        </Pressable>

        <Pressable style={styles.buttonSecondary} onPress={() => navigation.navigate('ResetarSenha')} disabled={loading}>
          <Text style={styles.buttonSecondaryText}>Resetar Senha</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    marginBottom: 20,
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
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#26B1A5',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonSecondaryText: {
    color: '#26B1A5',
    fontWeight: '600',
    fontSize: 16,
  },
});
