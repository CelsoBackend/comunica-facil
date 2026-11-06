import React from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { stylesResetarSenha } from "@/screens/styles/ResetarSenhaStyle";

type Props = {
  email: string;
  novaSenha: string;
  loading: boolean;
  onChangeEmail: (value: string) => void;
  onChangeNovaSenha: (value: string) => void;
  onResetarSenha: () => void;
};

export default function ResetarSenhaView({ email, novaSenha, loading, onChangeEmail, onChangeNovaSenha, onResetarSenha }: Props) {
  return (
    <View style={stylesResetarSenha.container}>
      <View style={stylesResetarSenha.card}>
        <Image source={require('../../../assets/icon.png')} style={stylesResetarSenha.icon} resizeMode="contain" />
        <Text style={stylesResetarSenha.title}>Resetar Senha</Text>

        <TextInput placeholder="email" value={email} onChangeText={onChangeEmail} style={stylesResetarSenha.input} autoCapitalize="none" />
        <TextInput
          placeholder="nova senha"
          value={novaSenha}
          onChangeText={onChangeNovaSenha}
          style={stylesResetarSenha.input}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable style={stylesResetarSenha.button} onPress={onResetarSenha} disabled={loading}>
          <Text style={stylesResetarSenha.buttonText}>{loading ? 'Carregando...' : 'Resetar Senha'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
