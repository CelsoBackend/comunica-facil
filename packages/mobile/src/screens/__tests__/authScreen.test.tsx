import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import AuthScreen from '../AuthScreen';

const mockFindByEmail = jest.fn();
const mockFindSessao = jest.fn();
const mockSaveSessao = jest.fn();
const mockRunMigrations = jest.fn();

jest.mock('@/data/repositories', () => ({
  UsuarioRepository: jest.fn().mockImplementation(() => ({
    findByEmail: (...args: unknown[]) => mockFindByEmail(...args),
  })),
  SessaoRepository: jest.fn().mockImplementation(() => ({
    findById: (...args: unknown[]) => mockFindSessao(...args),
    save: (...args: unknown[]) => mockSaveSessao(...args),
  })),
}));

jest.mock('@/data/storage', () => ({
  runMigrations: (...args: unknown[]) => mockRunMigrations(...args),
}));

describe('AuthScreen', () => {
  beforeEach(() => {
    mockFindByEmail.mockReset();
    mockFindSessao.mockReset();
    mockSaveSessao.mockReset();
    mockRunMigrations.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve autenticar com credenciais válidas e navegar para Home', async () => {
    const reset = jest.fn();
    mockFindByEmail.mockResolvedValueOnce({
      nome: 'Cuidador',
      email: 'cuidador@email.com',
      senhaHash: 'f0f0c0da8f7e22f8f87fba0f20f12c72794f9fbeed2f72e3fe7fb8672ff63f91',
    });
    mockFindSessao.mockResolvedValueOnce(null);

    const screen = render(<AuthScreen navigation={{ reset } as any} route={{ key: 'Auth-1', name: 'Auth' } as any} />);

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'cuidador@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockSaveSessao).toHaveBeenCalledTimes(1);
      expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Home' }] });
    });
  });

  it('deve mostrar erro quando login for inválido', async () => {
    const reset = jest.fn();
    mockFindByEmail.mockResolvedValueOnce(null);

    const screen = render(<AuthScreen navigation={{ reset } as any} route={{ key: 'Auth-1', name: 'Auth' } as any} />);

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'invalido@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Acesso negado', 'Credenciais inválidas.');
      expect(reset).not.toHaveBeenCalled();
    });
  });

  it('deve validar formato do email antes de tentar login', async () => {
    const reset = jest.fn();

    const screen = render(<AuthScreen navigation={{ reset } as any} route={{ key: 'Auth-1', name: 'Auth' } as any} />);

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'email-invalido');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Email inválido', 'Informe um email válido.');
      expect(mockRunMigrations).not.toHaveBeenCalled();
      expect(mockFindByEmail).not.toHaveBeenCalled();
      expect(reset).not.toHaveBeenCalled();
    });
  });

  it('deve navegar para criar conta e resetar senha', () => {
    const navigate = jest.fn();

    const screen = render(
      <AuthScreen
        navigation={{ navigate, reset: jest.fn() } as any}
        route={{ key: 'Auth-1', name: 'Auth' } as any}
      />,
    );

    fireEvent.press(screen.getByText('Criar conta'));
    expect(navigate).toHaveBeenCalledWith('CriarConta');

    fireEvent.press(screen.getByText('Resetar senha'));
    expect(navigate).toHaveBeenCalledWith('ResetarSenha');
  });
});
