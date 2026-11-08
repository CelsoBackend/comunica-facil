import { CuidadorService } from '../cuidadorService';
import { SENHA_MINIMA_CARACTERES } from '../usuarioService';

const mockFindByEmail = jest.fn();
const mockFindByTipoAndPacienteId = jest.fn();
const mockCreate = jest.fn();

jest.mock('@/data/repositories', () => ({
  UsuarioRepository: jest.fn().mockImplementation(() => ({
    findByEmail: (...args: unknown[]) => mockFindByEmail(...args),
    findByTipoAndPacienteId: (...args: unknown[]) => mockFindByTipoAndPacienteId(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  })),
}));

jest.mock('@/domain/security/utils/hash', () => ({
  hashSenha: (senha: string) => `hash:${senha}`,
}));

describe('CuidadorService', () => {
  let service: CuidadorService;

  beforeEach(() => {
    mockFindByEmail.mockReset();
    mockFindByTipoAndPacienteId.mockReset();
    mockCreate.mockReset();
    service = new CuidadorService();
  });

  describe('validarCuidador', () => {
    it('deve retornar inválido quando já existir um cuidador', () => {
      const resultado = service.validarCuidador('Carlos', 'carlos@email.com', '123456', true);
      expect(resultado).toEqual({
        valido: false,
        titulo: 'Limite atingido',
        mensagem: 'No MVP, é permitido cadastrar apenas 1 cuidador.',
      });
    });

    it('deve retornar inválido quando campos estiverem vazios', () => {
      const resultado = service.validarCuidador('', '', '', false);
      expect(resultado).toEqual({
        valido: false,
        titulo: 'Atenção',
        mensagem: 'Preencha nome, email e senha para criar o cuidador.',
      });
    });

    it('deve retornar inválido quando email for inválido', () => {
      const resultado = service.validarCuidador('Carlos', 'email-invalido', '123456', false);
      expect(resultado).toEqual({
        valido: false,
        titulo: 'Email inválido',
        mensagem: 'Informe um email válido para o cuidador.',
      });
    });

    it('deve retornar inválido quando senha for curta', () => {
      const resultado = service.validarCuidador('Carlos', 'carlos@email.com', '123', false);
      expect(resultado).toEqual({
        valido: false,
        titulo: 'Senha inválida',
        mensagem: `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`,
      });
    });

    it('deve retornar válido com dados corretos', () => {
      const resultado = service.validarCuidador('Carlos', 'carlos@email.com', '123456', false);
      expect(resultado).toEqual({ valido: true });
    });
  });

  describe('criarCuidador', () => {
    it('deve retornar erro quando email já estiver cadastrado', async () => {
      mockFindByEmail.mockResolvedValueOnce({ id: 'u-1', email: 'carlos@email.com' });

      const resultado = await service.criarCuidador('Carlos', 'carlos@email.com', '123456', 'p-1');

      expect(resultado).toEqual({
        sucesso: false,
        titulo: 'Conta existente',
        mensagem: 'Já existe uma conta cadastrada com este email.',
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('deve criar cuidador com sucesso', async () => {
      mockFindByEmail.mockResolvedValueOnce(null);
      mockCreate.mockResolvedValueOnce(undefined);

      const resultado = await service.criarCuidador('Carlos', 'carlos@email.com', '123456', 'p-1');

      expect(resultado).toEqual({ sucesso: true });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Carlos',
          email: 'carlos@email.com',
          senhaHash: 'hash:123456',
          tipo: 'cuidador',
          pacienteId: 'p-1',
        }),
      );
    });
  });

  describe('buscarCuidadorDoPaciente', () => {
    it('deve buscar cuidador pelo pacienteId', async () => {
      const cuidador = { id: 'u-2', nome: 'Carlos', tipo: 'cuidador', pacienteId: 'p-1' };
      mockFindByTipoAndPacienteId.mockResolvedValueOnce(cuidador);

      const resultado = await service.buscarCuidadorDoPaciente('p-1');

      expect(mockFindByTipoAndPacienteId).toHaveBeenCalledWith('cuidador', 'p-1');
      expect(resultado).toEqual(cuidador);
    });

    it('deve retornar null quando não houver cuidador', async () => {
      mockFindByTipoAndPacienteId.mockResolvedValueOnce(null);

      const resultado = await service.buscarCuidadorDoPaciente('p-1');

      expect(resultado).toBeNull();
    });
  });
});
