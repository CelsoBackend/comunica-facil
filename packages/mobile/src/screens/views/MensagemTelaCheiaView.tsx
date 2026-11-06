import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { stylesMensagemTelaCheia } from "@/screens/styles/MensagemTelaCheiaStyle";

type Props = {
  cor: string;
  corTexto: string;
  texto: string;
  onPress: () => void;
};

export default function MensagemTelaCheiaView({ cor, corTexto, texto, onPress }: Props) {
  return (
    <Pressable
      style={[stylesMensagemTelaCheia.container, { backgroundColor: cor }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Mensagem em tela cheia. Toque para voltar"
    >
      <View style={stylesMensagemTelaCheia.content}>
        <Text style={[stylesMensagemTelaCheia.texto, { color: corTexto }]}>{texto}</Text>
        <Text style={[stylesMensagemTelaCheia.ajudaRetorno, { color: corTexto }]}>Toque em qualquer lugar para voltar</Text>
      </View>
    </Pressable>
  );
}
