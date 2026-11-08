import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import CriarContaScreen from '../CriarContaScreen';

const mockValidarCriarConta = jest.fn();
const mockCriarConta = jest.fn();
const mockEncerrarSessao = jest.fn();

jest.mock('@/domain/services', () => ({
  getMensagemErro: (erro: unknown) => (erro instanceof Error ? erro.message : 'Tente novamente em instantes.'),
  UsuarioService: jest.fn().mockImplementation(() => ({
    validarCriarConta: (...args: unknown[]) => mockValidarCriarConta(...args),
    criarConta: (...args: unknown[]) => mockCriarConta(...args),
  })),
  SessaoService: jest.fn().mockImplementation(() => ({
    encerrarSessao: (...args: unknown[]) => mockEncerrarSessao(...args),
  })),
}));

describe('CriarContaScreen', () => {
  beforeEach(() => {
    mockValidarCriarConta.mockReset();
    mockCriarConta.mockReset();
    mockEncerrarSessao.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve validar formato do email antes de criar conta', async () => {
    const reset = jest.fn();
    mockValidarCriarConta.mockReturnValueOnce({
      valido: false,
      titulo: 'Email inválido',
      mensagem: 'Informe um email válido.',
    });

    const screen = render(
      <CriarContaScreen
        navigation={{ reset } as any}
        route={{ key: 'CriarConta-1', name: 'CriarConta' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('nome'), 'Ana');
    fireEvent.changeText(screen.getByPlaceholderText('email'), 'email-invalido');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getAllByText('Criar Conta')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Email inválido', 'Informe um email válido.');
      expect(mockCriarConta).not.toHaveBeenCalled();
      expect(reset).not.toHaveBeenCalled();
    });
  });

  it('deve criar conta e redirecionar para login', async () => {
    const reset = jest.fn();
    mockValidarCriarConta.mockReturnValueOnce({ valido: true });
    mockCriarConta.mockResolvedValueOnce({ sucesso: true });
    mockEncerrarSessao.mockResolvedValueOnce(undefined);

    const screen = render(
      <CriarContaScreen
        navigation={{ reset } as any}
        route={{ key: 'CriarConta-1', name: 'CriarConta' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('nome'), 'Ana');
    fireEvent.changeText(screen.getByPlaceholderText('email'), 'novo@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getAllByText('Criar Conta')[1]);

    await waitFor(() => {
      expect(mockCriarConta).toHaveBeenCalledWith('Ana', 'novo@email.com', '123456');
      expect(mockEncerrarSessao).toHaveBeenCalledTimes(1);
      expect(Alert.alert).toHaveBeenCalledWith('Conta criada', 'Conta criada com sucesso.');
      expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Auth' }] });
    });
  });

  it('deve mostrar erro quando email já estiver cadastrado', async () => {
    const reset = jest.fn();
    mockValidarCriarConta.mockReturnValueOnce({ valido: true });
    mockCriarConta.mockResolvedValueOnce({
      sucesso: false,
      titulo: 'Conta existente',
      mensagem: 'Já existe uma conta cadastrada com este email.',
    });

    const screen = render(
      <CriarContaScreen
        navigation={{ reset } as any}
        route={{ key: 'CriarConta-1', name: 'CriarConta' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('nome'), 'Ana');
    fireEvent.changeText(screen.getByPlaceholderText('email'), 'existente@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getAllByText('Criar Conta')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Conta existente', 'Já existe uma conta cadastrada com este email.');
      expect(reset).not.toHaveBeenCalled();
    });
  });
});
