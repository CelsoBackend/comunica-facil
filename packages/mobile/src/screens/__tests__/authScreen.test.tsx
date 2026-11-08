import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import AuthScreen from '../AuthScreen';

const mockValidarLogin = jest.fn();
const mockAutenticarUsuario = jest.fn();
const mockSalvarSessaoAtiva = jest.fn();

jest.mock('@/domain/services', () => ({
  getMensagemErro: (erro: unknown) => (erro instanceof Error ? erro.message : 'Tente novamente em instantes.'),
  UsuarioService: jest.fn().mockImplementation(() => ({
    validarLogin: (...args: unknown[]) => mockValidarLogin(...args),
    autenticarUsuario: (...args: unknown[]) => mockAutenticarUsuario(...args),
  })),
  SessaoService: jest.fn().mockImplementation(() => ({
    salvarSessaoAtiva: (...args: unknown[]) => mockSalvarSessaoAtiva(...args),
  })),
}));

describe('AuthScreen', () => {
  beforeEach(() => {
    mockValidarLogin.mockReset();
    mockAutenticarUsuario.mockReset();
    mockSalvarSessaoAtiva.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve autenticar com credenciais válidas e navegar para Home', async () => {
    const reset = jest.fn();
    mockValidarLogin.mockReturnValueOnce({ valido: true });
    mockAutenticarUsuario.mockResolvedValueOnce({ sucesso: true, usuario: { nome: 'Paciente' } });
    mockSalvarSessaoAtiva.mockResolvedValueOnce(undefined);

    const screen = render(
      <AuthScreen navigation={{ reset } as any} route={{ key: 'Auth-1', name: 'Auth' } as any} />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'paciente@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getAllByText('Login')[1]);

    await waitFor(() => {
      expect(mockSalvarSessaoAtiva).toHaveBeenCalledWith('Paciente');
      expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Home' }] });
    });
  });

  it('deve mostrar erro quando credenciais forem inválidas', async () => {
    const reset = jest.fn();
    mockValidarLogin.mockReturnValueOnce({ valido: true });
    mockAutenticarUsuario.mockResolvedValueOnce({
      sucesso: false,
      titulo: 'Acesso negado',
      mensagem: 'Credenciais inválidas.',
    });

    const screen = render(
      <AuthScreen navigation={{ reset } as any} route={{ key: 'Auth-1', name: 'Auth' } as any} />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'invalido@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getAllByText('Login')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Acesso negado', 'Credenciais inválidas.');
      expect(reset).not.toHaveBeenCalled();
    });
  });

  it('deve validar formato do email antes de tentar login', async () => {
    const reset = jest.fn();
    mockValidarLogin.mockReturnValueOnce({
      valido: false,
      titulo: 'Email inválido',
      mensagem: 'Informe um email válido.',
    });

    const screen = render(
      <AuthScreen navigation={{ reset } as any} route={{ key: 'Auth-1', name: 'Auth' } as any} />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'email-invalido');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getAllByText('Login')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Email inválido', 'Informe um email válido.');
      expect(mockAutenticarUsuario).not.toHaveBeenCalled();
      expect(reset).not.toHaveBeenCalled();
    });
  });

  it('deve navegar para criar conta e resetar senha', () => {
    const navigate = jest.fn();
    mockValidarLogin.mockReturnValue({ valido: true });

    const screen = render(
      <AuthScreen
        navigation={{ navigate, reset: jest.fn() } as any}
        route={{ key: 'Auth-1', name: 'Auth' } as any}
      />,
    );

    fireEvent.press(screen.getByText('Criar Conta'));
    expect(navigate).toHaveBeenCalledWith('CriarConta');

    fireEvent.press(screen.getByText('Resetar Senha'));
    expect(navigate).toHaveBeenCalledWith('ResetarSenha');
  });
});
