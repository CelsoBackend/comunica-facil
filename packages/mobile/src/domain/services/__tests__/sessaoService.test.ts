import { SessaoService, SESSAO_ID } from '../sessaoService';

const mockFindById = jest.fn();
const mockSave = jest.fn();

jest.mock('@/data/repositories', () => ({
  SessaoRepository: jest.fn().mockImplementation(() => ({
    findById: (...args: unknown[]) => mockFindById(...args),
    save: (...args: unknown[]) => mockSave(...args),
  })),
}));

describe('SessaoService', () => {
  let service: SessaoService;

  beforeEach(() => {
    mockFindById.mockReset();
    mockSave.mockReset();
    service = new SessaoService();
  });

  describe('salvarSessaoAtiva', () => {
    it('deve criar sessão ativa quando não existir sessão prévia', async () => {
      mockFindById.mockResolvedValueOnce(null);
      mockSave.mockResolvedValueOnce(undefined);

      await service.salvarSessaoAtiva('Ana');

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: SESSAO_ID,
          ativa: true,
          usuarioNome: 'Ana',
        }),
      );
    });

    it('deve preservar criadoEm da sessão existente ao salvar', async () => {
      const criadoEm = '2026-01-01T10:00:00.000Z';
      mockFindById.mockResolvedValueOnce({ id: SESSAO_ID, criadoEm, ativa: false, usuarioNome: null, atualizadoEm: criadoEm });
      mockSave.mockResolvedValueOnce(undefined);

      await service.salvarSessaoAtiva('Carlos');

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: SESSAO_ID,
          ativa: true,
          usuarioNome: 'Carlos',
          criadoEm,
        }),
      );
    });
  });

  describe('encerrarSessao', () => {
    it('deve salvar sessão inativa com usuarioNome nulo', async () => {
      mockFindById.mockResolvedValueOnce(null);
      mockSave.mockResolvedValueOnce(undefined);

      await service.encerrarSessao();

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: SESSAO_ID,
          ativa: false,
          usuarioNome: null,
        }),
      );
    });

    it('deve preservar criadoEm da sessão existente ao encerrar', async () => {
      const criadoEm = '2026-01-01T10:00:00.000Z';
      mockFindById.mockResolvedValueOnce({ id: SESSAO_ID, criadoEm, ativa: true, usuarioNome: 'Ana', atualizadoEm: criadoEm });
      mockSave.mockResolvedValueOnce(undefined);

      await service.encerrarSessao();

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: SESSAO_ID,
          ativa: false,
          usuarioNome: null,
          criadoEm,
        }),
      );
    });
  });

  describe('buscarSessaoAtiva', () => {
    it('deve retornar null quando não houver sessão', async () => {
      mockFindById.mockResolvedValueOnce(null);

      const resultado = await service.buscarSessaoAtiva();

      expect(resultado).toBeNull();
      expect(mockFindById).toHaveBeenCalledWith(SESSAO_ID);
    });

    it('deve retornar a sessão existente', async () => {
      const sessao = { id: SESSAO_ID, ativa: true, usuarioNome: 'Ana', criadoEm: '2026-01-01', atualizadoEm: '2026-01-01' };
      mockFindById.mockResolvedValueOnce(sessao);

      const resultado = await service.buscarSessaoAtiva();

      expect(resultado).toEqual(sessao);
    });
  });
});
