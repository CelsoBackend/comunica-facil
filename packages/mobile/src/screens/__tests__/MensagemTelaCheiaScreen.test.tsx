import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import MensagemTelaCheiaScreen from '../mensagemTelaCheiaScreen';

const mockSpeak = jest.fn();
const mockStop = jest.fn();

jest.mock('expo-speech', () => ({
  speak: (...args: unknown[]) => mockSpeak(...args),
  stop: () => mockStop(),
}));

describe('Fluxo assistivo - MensagemTelaCheia', () => {
  beforeEach(() => {
    mockSpeak.mockReset();
    mockStop.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve disparar TTS e permitir voltar por toque', async () => {
    const goBack = jest.fn();

    const screen = render(
      <MensagemTelaCheiaScreen
        navigation={{ goBack } as any}
        route={{ key: 'MensagemTelaCheia-1', name: 'MensagemTelaCheia', params: { texto: 'SIM', cor: '#22c55e' } } as any}
      />,
    );

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalledWith(
        'SIM',
        expect.objectContaining({ language: 'pt-BR', rate: 0.95, pitch: 1 }),
      );
    });

    fireEvent.press(screen.getByLabelText('Mensagem em tela cheia. Toque para voltar'));
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('deve exibir alerta quando TTS lança erro', async () => {
    mockSpeak.mockImplementation(() => {
      throw new Error('TTS indisponível');
    });

    render(
      <MensagemTelaCheiaScreen
        navigation={{ goBack: jest.fn() } as any}
        route={{ key: 'MensagemTelaCheia-1', name: 'MensagemTelaCheia', params: { texto: 'NÃO', cor: '#ef4444' } } as any}
      />,
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Áudio indisponível', 'Não foi possível reproduzir a fala neste momento.');
    });
  });
});
