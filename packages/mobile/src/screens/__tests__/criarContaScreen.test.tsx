import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import CriarContaScreen from '../CriarContaScreen';

const mockFindByEmail = jest.fn();
const mockCreate = jest.fn();
const mockFindSessao = jest.fn();
const mockSaveSessao = jest.fn();
const mockRunMigrations = jest.fn();

jest.mock('@/data/repositories', () => ({
  UsuarioRepository: jest.fn().mockImplementation(() => ({
    findByEmail: (...args: unknown[]) => mockFindByEmail(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  })),
  SessaoRepository: jest.fn().mockImplementation(() => ({
    findById: (...args: unknown[]) => mockFindSessao(...args),
    save: (...args: unknown[]) => mockSaveSessao(...args),
  })),
}));

jest.mock('@/data/storage', () => ({
  runMigrations: (...args: unknown[]) => mockRunMigrations(...args),
}));

describe('CriarContaScreen', () => {
  beforeEach(() => {
    mockFindByEmail.mockReset();
    mockCreate.mockReset();
    mockFindSessao.mockReset();
    mockSaveSessao.mockReset();
    mockRunMigrations.mockReset();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve validar formato do email antes de criar conta', async () => {
    const reset = jest.fn();

    const screen = render(
      <criarContaScreen
        navigation={{ reset } as any}
        route={{ key: 'CriarConta-1', name: 'CriarConta' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('email'), 'email-invalido');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getByText('Criar conta'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Email inválido', 'Informe um email válido.');
      expect(mockRunMigrations).not.toHaveBeenCalled();
      expect(mockFindByEmail).not.toHaveBeenCalled();
      expect(reset).not.toHaveBeenCalled();
    });
  });

  it('deve criar conta e voltar para o login', async () => {
    const reset = jest.fn();
    mockFindByEmail.mockResolvedValueOnce(null);
    mockFindSessao.mockResolvedValueOnce(null);

    const screen = render(
      <criarContaScreen
        navigation={{ reset } as any}
        route={{ key: 'CriarConta-1', name: 'CriarConta' } as any}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('nome'), 'Ana');
    fireEvent.changeText(screen.getByPlaceholderText('email'), 'novo@email.com');
    fireEvent.changeText(screen.getByPlaceholderText('senha'), '123456');
    fireEvent.press(screen.getByText('Criar conta'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Ana',
          email: 'novo@email.com',
          tipo: 'paciente',
        }),
      );
      expect(mockSaveSessao).toHaveBeenCalledTimes(1);
      expect(mockSaveSessao).toHaveBeenCalledWith(
        expect.objectContaining({
          ativa: false,
          usuarioNome: null,
        }),
      );
      expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Auth' }] });
    });
  });
});
