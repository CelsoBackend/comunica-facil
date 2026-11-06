import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { stylesLoginCuidadorEdicao } from "@/screens/styles/LoginCuidadorEdicaoStyle";

type Props = {
  email: string;
  senha: string;
  loading: boolean;
  onChangeEmail: (value: string) => void;
  onChangeSenha: (value: string) => void;
  onAutenticar: () => void;
  onResetarSenha: () => void;
};

export default function LoginCuidadorEdicaoView({ email, senha, loading, onChangeEmail, onChangeSenha, onAutenticar, onResetarSenha }: Props) {
  return (
    <View style={stylesLoginCuidadorEdicao.container}>
      <View style={stylesLoginCuidadorEdicao.card}>
        <Text style={stylesLoginCuidadorEdicao.title}>Login Cuidador</Text>

        <TextInput placeholder="email" value={email} onChangeText={onChangeEmail} style={stylesLoginCuidadorEdicao.input} autoCapitalize="none" />
        <TextInput
          placeholder="senha"
          value={senha}
          onChangeText={onChangeSenha}
          style={stylesLoginCuidadorEdicao.input}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable style={stylesLoginCuidadorEdicao.button} onPress={onAutenticar} disabled={loading}>
          <Text style={stylesLoginCuidadorEdicao.buttonText}>{loading ? 'Carregando...' : 'Entrar no modo edição'}</Text>
        </Pressable>

        <Pressable style={stylesLoginCuidadorEdicao.buttonSecondary} onPress={onResetarSenha} disabled={loading}>
          <Text style={stylesLoginCuidadorEdicao.buttonSecondaryText}>Resetar Senha</Text>
        </Pressable>
      </View>
    </View>
  );
}
