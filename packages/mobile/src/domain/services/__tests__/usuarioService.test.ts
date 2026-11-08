import { UsuarioService, SENHA_MINIMA_CARACTERES } from '../usuarioService';

const mockFindByEmail = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRunMigrations = jest.fn();

jest.mock('@/data/repositories', () => ({
  UsuarioRepository: jest.fn().mockImplementation(() => ({
    findByEmail: (...args: unknown[]) => mockFindByEmail(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  })),
}));

jest.mock('@/data/storage', () => ({
  runMigrations: (...args: unknown[]) => mockRunMigrations(...args),
}));

jest.mock('@/domain/security/utils/hash', () => ({
  hashSenha: (senha: string) => `hash:${senha}`,
}));

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(() => {
    mockFindByEmail.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockRunMigrations.mockReset();
    service = new UsuarioService();
  });

  describe('validarCriarConta', () => {
    it('deve retornar inválido quando campos estiverem vazios', () => {
      const resultado = service.validarCriarConta('', '', '');
      expect(resultado).toEqual({ valido: false, titulo: 'Atenção', mensagem: 'Informe nome, email e senha para criar conta.' });
    });

    it('deve retornar inválido quando email for inválido', () => {
      const resultado = service.validarCriarConta('Ana', 'email-invalido', '123456');
      expect(resultado).toEqual({ valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido.' });
    });

    it('deve retornar inválido quando senha for curta', () => {
      const resultado = service.validarCriarConta('Ana', 'ana@email.com', '123');
      expect(resultado).toEqual({
        valido: false,
        titulo: 'Senha inválida',
        mensagem: `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`,
      });
    });

    it('deve retornar válido com dados corretos', () => {
      const resultado = service.validarCriarConta('Ana', 'ana@email.com', '123456');
      expect(resultado).toEqual({ valido: true });
    });
  });

  describe('validarLogin', () => {
    it('deve retornar inválido quando campos estiverem vazios', () => {
      const resultado = service.validarLogin('', '');
      expect(resultado).toEqual({ valido: false, titulo: 'Atenção', mensagem: 'Informe email e senha.' });
    });

    it('deve retornar inválido quando email for inválido', () => {
      const resultado = service.validarLogin('email-invalido', '123456');
      expect(resultado).toEqual({ valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido.' });
    });

    it('deve retornar válido com dados corretos', () => {
      const resultado = service.validarLogin('ana@email.com', '123456');
      expect(resultado).toEqual({ valido: true });
    });
  });

  describe('validarResetarSenha', () => {
    it('deve retornar inválido quando campos estiverem vazios', () => {
      const resultado = service.validarResetarSenha('', '');
      expect(resultado).toEqual({ valido: false, titulo: 'Atenção', mensagem: 'Informe email e nova senha.' });
    });

    it('deve retornar inválido quando email for inválido', () => {
      const resultado = service.validarResetarSenha('email-invalido', '123456');
      expect(resultado).toEqual({ valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido.' });
    });

    it('deve retornar inválido quando nova senha for curta', () => {
      const resultado = service.validarResetarSenha('ana@email.com', '123');
      expect(resultado).toEqual({
        valido: false,
        titulo: 'Senha inválida',
        mensagem: `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`,
      });
    });

    it('deve retornar válido com dados corretos', () => {
      const resultado = service.validarResetarSenha('ana@email.com', '123456');
      expect(resultado).toEqual({ valido: true });
    });
  });

  describe('criarConta', () => {
    it('deve retornar erro quando email já estiver cadastrado', async () => {
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByEmail.mockResolvedValueOnce({ id: 'u-1', email: 'ana@email.com' });

      const resultado = await service.criarConta('Ana', 'ana@email.com', '123456');

      expect(resultado).toEqual({
        sucesso: false,
        titulo: 'Conta existente',
        mensagem: 'Já existe uma conta cadastrada com este email.',
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('deve criar conta com sucesso', async () => {
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByEmail.mockResolvedValueOnce(null);
      mockCreate.mockResolvedValueOnce(undefined);

      const resultado = await service.criarConta('Ana', 'ana@email.com', '123456');

      expect(resultado).toEqual({ sucesso: true });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Ana',
          email: 'ana@email.com',
          senhaHash: 'hash:123456',
          tipo: 'paciente',
        }),
      );
    });
  });

  describe('autenticarUsuario', () => {
    it('deve retornar erro quando usuário não for encontrado', async () => {
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByEmail.mockResolvedValueOnce(null);

      const resultado = await service.autenticarUsuario('ana@email.com', '123456');

      expect(resultado).toEqual({ sucesso: false, titulo: 'Acesso negado', mensagem: 'Credenciais inválidas.' });
    });

    it('deve retornar erro quando senha estiver incorreta', async () => {
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByEmail.mockResolvedValueOnce({ id: 'u-1', senhaHash: 'hash:outraSenha', tipo: 'paciente' });

      const resultado = await service.autenticarUsuario('ana@email.com', '123456');

      expect(resultado).toEqual({ sucesso: false, titulo: 'Acesso negado', mensagem: 'Credenciais inválidas.' });
    });

    it('deve retornar erro quando usuário não for do tipo paciente', async () => {
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByEmail.mockResolvedValueOnce({ id: 'u-1', senhaHash: 'hash:123456', tipo: 'cuidador' });

      const resultado = await service.autenticarUsuario('ana@email.com', '123456');

      expect(resultado).toEqual({
        sucesso: false,
        titulo: 'Acesso negado',
        mensagem: 'Use o login do paciente para acessar a Home.',
      });
    });

    it('deve autenticar com sucesso', async () => {
      const usuario = { id: 'u-1', nome: 'Ana', senhaHash: 'hash:123456', tipo: 'paciente' };
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByEmail.mockResolvedValueOnce(usuario);

      const resultado = await service.autenticarUsuario('ana@email.com', '123456');

      expect(resultado).toEqual({ sucesso: true, usuario });
    });
  });

  describe('resetarSenha', () => {
    it('deve retornar erro quando email não for encontrado', async () => {
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByEmail.mockResolvedValueOnce(null);

      const resultado = await service.resetarSenha('ana@email.com', 'novaSenha');

      expect(resultado).toEqual({
        sucesso: false,
        titulo: 'Atenção',
        mensagem: 'não foi possivel resetar a senha email invalido',
      });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('deve resetar senha com sucesso', async () => {
      const usuario = { id: 'u-1', nome: 'Ana', senhaHash: 'hash:antiga', tipo: 'paciente', criadoEm: '2026-01-01' };
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByEmail.mockResolvedValueOnce(usuario);
      mockUpdate.mockResolvedValueOnce(undefined);

      const resultado = await service.resetarSenha('ana@email.com', 'novaSenha');

      expect(resultado).toEqual({ sucesso: true });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ senhaHash: 'hash:novaSenha' }),
      );
    });
  });
});
