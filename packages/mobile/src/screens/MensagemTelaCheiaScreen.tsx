import React, { useEffect } from 'react';
import * as Speech from 'expo-speech';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import MensagemTelaCheiaView from "@/screens/views/MensagemTelaCheiaView";

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

export default function MensagemTelaCheiaScreen({ navigation, route }: Props) {
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
    <MensagemTelaCheiaView
      cor={cor}
      corTexto={corTexto}
      texto={texto}
      onPress={() => navigation.goBack()}
    />
  );
}
