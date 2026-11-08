import React from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { stylesCriarConta } from "@/screens/styles/CriarContaStyle";

type Props = {
  nome: string;
  email: string;
  senha: string;
  loading: boolean;
  onChangeNome: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeSenha: (value: string) => void;
  onCriarConta: () => void;
};

export default function CriarContaView({ nome, email, senha, loading, onChangeNome, onChangeEmail, onChangeSenha, onCriarConta }: Props) {
  return (
    <View style={stylesCriarConta.container}>
      <View style={stylesCriarConta.card}>
        <Image source={require('../../../assets/icon.png')} style={stylesCriarConta.icon} resizeMode="contain" />
        <Text style={stylesCriarConta.title}>Criar Conta</Text>

        <View style={stylesCriarConta.fieldRow}>
          <Text style={stylesCriarConta.fieldLabel}>Nome:</Text>
          <TextInput value={nome} onChangeText={onChangeNome} style={stylesCriarConta.inputFlex} autoCapitalize="words" />
        </View>

        <View style={stylesCriarConta.fieldRow}>
          <Text style={stylesCriarConta.fieldLabel}>Email:</Text>
          <TextInput value={email} onChangeText={onChangeEmail} style={stylesCriarConta.inputFlex} autoCapitalize="none" />
        </View>

        <View style={stylesCriarConta.fieldRow}>
          <Text style={stylesCriarConta.fieldLabel}>Senha:</Text>
          <TextInput
            value={senha}
            onChangeText={onChangeSenha}
            style={stylesCriarConta.inputFlex}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <Pressable style={stylesCriarConta.button} onPress={onCriarConta} disabled={loading}>
          <Text style={stylesCriarConta.buttonText}>{loading ? 'Carregando...' : 'Criar Conta'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
