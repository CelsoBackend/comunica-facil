import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import ResetarSenhaScreen from '../ResetarSenhaScreen';

const mockValidarResetarSenha = jest.fn();
const mockResetarSenha = jest.fn();

jest.mock('@/domain/services', () => ({
  getMensagemErro: (erro: unknown) => (erro instanceof Error ? erro.message : 'Tente novamente em instantes.'),
  UsuarioService: jest.fn().mockImplementation(() => ({
    validarResetarSenha: (...args: unknown[]) => mockValidarResetarSenha(...args),
    resetarSenha: (...args: unknown[]) => mockResetarSenha(...args),
  })),
}));

describe('ResetarSenhaScreen', () => {
  beforeEach(() => {
    mockValidarResetarSenha.mockReset();
    mockResetarSenha.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve validar formato do email antes de resetar senha', async () => {
    const reset = jest.fn();
    mockValidarResetarSenha.mockReturnValueOnce({
      valido: false,
      titulo: 'Email inválido',
      mensagem: 'Informe um email válido.',
    });

    const screen = render(
      <ResetarSenhaScreen
        navigation={{ reset } as any}
        route={{ key: 'ResetarSenha-1', name: 'ResetarSenha' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'email-invalido');
    fireEvent.changeText(screen.getByPlaceholderText('nova senha'), '123456');
    fireEvent.press(screen.getAllByText('Resetar Senha')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Email inválido', 'Informe um email válido.');
      expect(mockResetarSenha).not.toHaveBeenCalled();
      expect(reset).not.toHaveBeenCalled();
    });
  });

  it('deve mostrar alerta e redirecionar para login quando email não for encontrado', async () => {
    const reset = jest.fn();
    mockValidarResetarSenha.mockReturnValueOnce({ valido: true });
    mockResetarSenha.mockResolvedValueOnce({
      sucesso: false,
      titulo: 'Atenção',
      mensagem: 'não foi possivel resetar a senha email invalido',
    });

    const screen = render(
      <ResetarSenhaScreen
        navigation={{ reset } as any}
        route={{ key: 'ResetarSenha-1', name: 'ResetarSenha' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'invalido@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('nova senha'), '123456');
    fireEvent.press(screen.getAllByText('Resetar Senha')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'não foi possivel resetar a senha email invalido');
      expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Auth' }] });
    });
  });

  it('deve resetar senha com sucesso e redirecionar para login', async () => {
    const reset = jest.fn();
    mockValidarResetarSenha.mockReturnValueOnce({ valido: true });
    mockResetarSenha.mockResolvedValueOnce({ sucesso: true });

    const screen = render(
      <ResetarSenhaScreen
        navigation={{ reset } as any}
        route={{ key: 'ResetarSenha-1', name: 'ResetarSenha' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'valido@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('nova senha'), 'novaSenha123');
    fireEvent.press(screen.getAllByText('Resetar Senha')[1]);

    await waitFor(() => {
      expect(mockResetarSenha).toHaveBeenCalledWith('valido@email.com', 'novaSenha123');
      expect(Alert.alert).toHaveBeenCalledWith('Senha atualizada', 'Senha resetada com sucesso.');
      expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Auth' }] });
    });
  });
});
