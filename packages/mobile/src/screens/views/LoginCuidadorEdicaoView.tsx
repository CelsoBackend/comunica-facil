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

        <View style={stylesLoginCuidadorEdicao.fieldRow}>
          <Text style={stylesLoginCuidadorEdicao.fieldLabel}>Email:</Text>
          <TextInput value={email} onChangeText={onChangeEmail} style={stylesLoginCuidadorEdicao.inputFlex} autoCapitalize="none" />
        </View>

        <View style={stylesLoginCuidadorEdicao.fieldRow}>
          <Text style={stylesLoginCuidadorEdicao.fieldLabel}>Senha:</Text>
          <TextInput
            value={senha}
            onChangeText={onChangeSenha}
            style={stylesLoginCuidadorEdicao.inputFlex}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

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
