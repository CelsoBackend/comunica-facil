import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'MensagemTelaCheia'>;

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const sanitized = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) {
    return null;
  }

  const value = Number.parseInt(sanitized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const getCorTextoPorContraste = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return '#111827';
  }

  const luminancia = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminancia > 0.6 ? '#111827' : '#ffffff';
};

export default function mensagemTelaCheiaScreen({ navigation, route }: Props) {
  const { atencao, texto, cor } = route.params;
  const corTexto = getCorTextoPorContraste(cor);

  useEffect(() => {
    let ativo = true;

    const voltarHome = () => {
      if (!ativo) {
        return;
      }
      navigation.navigate('Home');
    };

    try {
      Speech.stop();
      Speech.speak(atencao, {
        language: 'pt-BR',
        rate: 0.95,
        pitch: 1,
        onDone: () => {
          if (!ativo) {
            return;
          }

          Speech.speak(texto, {
            language: 'pt-BR',
            rate: 0.95,
            pitch: 1,
            onError: voltarHome,
          });
        },
        onError: voltarHome,
      });
    } catch {
      voltarHome();
    }

    return () => {
      ativo = false;
      Speech.stop();
    };
  }, [atencao, navigation, texto]);

  return (
    <Pressable
      style={[styles.container, { backgroundColor: cor }]}
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel="Mensagem em tela cheia. Toque para voltar"
    >
      <View style={styles.content}>
        <Text style={[styles.texto, { color: corTexto }]}>{texto}</Text>
        <Text style={[styles.ajudaRetorno, { color: corTexto }]}>Toque em qualquer lugar para voltar</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  texto: {
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '800',
    textAlign: 'center',
  },
  ajudaRetorno: {
    marginTop: 24,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    textAlign: 'center',
  },
});