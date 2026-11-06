import React from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { stylesAuth } from "@/screens/styles/AuthStyle";

type Props = {
  email: string;
  senha: string;
  loading: boolean;
  onChangeEmail: (value: string) => void;
  onChangeSenha: (value: string) => void;
  onLogin: () => void;
  onCriarConta: () => void;
  onResetarSenha: () => void;
};

export default function AuthView({ email, senha, loading, onChangeEmail, onChangeSenha, onLogin, onCriarConta, onResetarSenha }: Props) {
  return (
    <View style={stylesAuth.container}>
      <View style={stylesAuth.card}>
        <Image source={require('../../../assets/icon.png')} style={stylesAuth.icon} resizeMode="contain" />
        <Text style={stylesAuth.title}>Login</Text>

        <TextInput placeholder="email" value={email} onChangeText={onChangeEmail} style={stylesAuth.input} autoCapitalize="none" />
        <TextInput
          placeholder="senha"
          value={senha}
          onChangeText={onChangeSenha}
          style={stylesAuth.input}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable style={stylesAuth.button} onPress={onLogin} disabled={loading}>
          <Text style={stylesAuth.buttonText}>{loading ? 'Carregando...' : 'Login'}</Text>
        </Pressable>

        <Pressable style={stylesAuth.buttonSecondary} onPress={onCriarConta} disabled={loading}>
          <Text style={stylesAuth.buttonSecondaryText}>Criar Conta</Text>
        </Pressable>

        <Pressable style={stylesAuth.buttonSecondary} onPress={onResetarSenha} disabled={loading}>
          <Text style={stylesAuth.buttonSecondaryText}>Resetar Senha</Text>
        </Pressable>
      </View>
    </View>
  );
}
