import { PacienteService } from '../pacienteService';
import { SENHA_MINIMA_CARACTERES } from '../usuarioService';

const mockFindByTipo = jest.fn();
const mockCreate = jest.fn();
const mockRunMigrations = jest.fn();

jest.mock('@/data/repositories', () => ({
  UsuarioRepository: jest.fn().mockImplementation(() => ({
    findByTipo: (...args: unknown[]) => mockFindByTipo(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  })),
}));

jest.mock('@/data/storage', () => ({
  runMigrations: (...args: unknown[]) => mockRunMigrations(...args),
}));

jest.mock('@/domain/security/utils/hash', () => ({
  hashSenha: (senha: string) => `hash:${senha}`,
}));

describe('PacienteService', () => {
  let service: PacienteService;

  beforeEach(() => {
    mockFindByTipo.mockReset();
    mockCreate.mockReset();
    mockRunMigrations.mockReset();
    service = new PacienteService();
  });

  describe('validarPaciente', () => {
    it('deve retornar inválido quando campos estiverem vazios', () => {
      const resultado = service.validarPaciente('', '');
      expect(resultado).toEqual({
        valido: false,
        titulo: 'Atenção',
        mensagem: 'Preencha nome e senha para criar a conta do paciente.',
      });
    });

    it('deve retornar inválido quando senha for curta', () => {
      const resultado = service.validarPaciente('Ana', '123');
      expect(resultado).toEqual({
        valido: false,
        titulo: 'Senha inválida',
        mensagem: `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`,
      });
    });

    it('deve retornar válido com dados corretos', () => {
      const resultado = service.validarPaciente('Ana', '123456');
      expect(resultado).toEqual({ valido: true });
    });
  });

  describe('criarPaciente', () => {
    it('deve criar paciente com sucesso', async () => {
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockCreate.mockResolvedValueOnce(undefined);

      const resultado = await service.criarPaciente('Ana', '123456');

      expect(resultado).toEqual({ sucesso: true });
      expect(mockRunMigrations).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Ana',
          senhaHash: 'hash:123456',
          tipo: 'paciente',
        }),
      );
    });
  });

  describe('buscarPaciente', () => {
    it('deve retornar null quando não houver paciente', async () => {
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByTipo.mockResolvedValueOnce(null);

      const resultado = await service.buscarPaciente();

      expect(mockRunMigrations).toHaveBeenCalledTimes(1);
      expect(mockFindByTipo).toHaveBeenCalledWith('paciente');
      expect(resultado).toBeNull();
    });

    it('deve retornar o paciente existente', async () => {
      const paciente = { id: 'p-1', nome: 'Ana', tipo: 'paciente', criadoEm: '2026-01-01' };
      mockRunMigrations.mockResolvedValueOnce(undefined);
      mockFindByTipo.mockResolvedValueOnce(paciente);

      const resultado = await service.buscarPaciente();

      expect(resultado).toEqual(paciente);
    });
  });
});
