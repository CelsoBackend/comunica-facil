import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import ResetarSenhaScreen from '../ResetarSenhaScreen';

const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();
const mockRunMigrations = jest.fn();

jest.mock('@/data/repositories', () => ({
  UsuarioRepository: jest.fn().mockImplementation(() => ({
    findByEmail: (...args: unknown[]) => mockFindByEmail(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  })),
}));

jest.mock('@/data/storage', () => ({
  runMigrations: (...args: unknown[]) => mockRunMigrations(...args),
}));

describe('ResetarSenhaScreen', () => {
  beforeEach(() => {
    mockFindByEmail.mockReset();
    mockUpdate.mockReset();
    mockRunMigrations.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve mostrar alerta e redirecionar para login quando email for inválido', async () => {
    const reset = jest.fn();
    mockFindByEmail.mockResolvedValueOnce(null);

    const screen = render(
      <resetarSenhaScreen
        navigation={{ reset } as any}
        route={{ key: 'ResetarSenha-1', name: 'ResetarSenha' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'invalido@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('nova senha'), '123456');
    fireEvent.press(screen.getByText('Resetar senha'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'não foi possivel resetar a senha email invalido');
      expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Auth' }] });
    });
  });

  it('deve validar formato do email antes de resetar senha', async () => {
    const reset = jest.fn();

    const screen = render(
      <resetarSenhaScreen
        navigation={{ reset } as any}
        route={{ key: 'ResetarSenha-1', name: 'ResetarSenha' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'email-invalido');
    fireEvent.changeText(screen.getByPlaceholderText('nova senha'), '123456');
    fireEvent.press(screen.getByText('Resetar senha'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Email inválido', 'Informe um email válido.');
      expect(mockRunMigrations).not.toHaveBeenCalled();
      expect(mockFindByEmail).not.toHaveBeenCalled();
      expect(reset).not.toHaveBeenCalled();
    });
  });
});