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

        <View style={stylesResetarSenha.fieldRow}>
          <Text style={stylesResetarSenha.fieldLabel}>Email:</Text>
          <TextInput value={email} onChangeText={onChangeEmail} style={stylesResetarSenha.inputFlex} autoCapitalize="none" />
        </View>

        <View style={stylesResetarSenha.fieldRow}>
          <Text style={stylesResetarSenha.fieldLabel}>Nova Senha:</Text>
          <TextInput
            value={novaSenha}
            onChangeText={onChangeNovaSenha}
            style={stylesResetarSenha.inputFlex}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <Pressable style={stylesResetarSenha.button} onPress={onResetarSenha} disabled={loading}>
          <Text style={stylesResetarSenha.buttonText}>{loading ? 'Carregando...' : 'Resetar Senha'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
