import { BotaoService, BOTOES_PADRAO, COR_PADRAO_BOTAO } from '../botaoService';

const mockFindAll = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/data/repositories', () => ({
  BotaoRepository: jest.fn().mockImplementation(() => ({
    findAll: (...args: unknown[]) => mockFindAll(...args),
    findById: (...args: unknown[]) => mockFindById(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  })),
}));

const makeBotao = (overrides = {}) => ({
  id: 'b-1',
  texto: 'Sim',
  cor: '#86EFAC',
  ordem: 1,
  ativo: true,
  criadoEm: '2026-01-01T10:00:00.000Z',
  atualizadoEm: '2026-01-01T10:00:00.000Z',
  ...overrides,
});

describe('BotaoService', () => {
  let service: BotaoService;

  beforeEach(() => {
    mockFindAll.mockReset();
    mockFindById.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockDelete.mockReset();
    service = new BotaoService();
  });

  describe('buscarBotoesAtivos', () => {
    it('deve retornar apenas botões ativos', async () => {
      const botoes = [makeBotao()];
      mockFindAll.mockResolvedValueOnce(botoes);

      const resultado = await service.buscarBotoesAtivos();

      expect(mockFindAll).toHaveBeenCalledWith(true);
      expect(resultado).toEqual(botoes);
    });
  });

  describe('criarBotao', () => {
    it('deve criar botão com ordem incrementada', async () => {
      mockCreate.mockResolvedValueOnce(undefined);

      await service.criarBotao('Novo', '#FF0000', 3);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          texto: 'Novo',
          cor: '#FF0000',
          ordem: 4,
          ativo: true,
        }),
      );
    });
  });

  describe('atualizarBotao', () => {
    it('deve atualizar texto e cor do botão', async () => {
      const botao = makeBotao();
      mockUpdate.mockResolvedValueOnce(undefined);

      await service.atualizarBotao(botao, 'Não', '#FCA5A5');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'b-1', texto: 'Não', cor: '#FCA5A5' }),
      );
    });
  });

  describe('excluirBotaoEReordenar', () => {
    it('deve excluir botão e reordenar os restantes', async () => {
      const restantes = [
        makeBotao({ id: 'b-2', ordem: 2 }),
        makeBotao({ id: 'b-3', ordem: 3 }),
      ];
      mockDelete.mockResolvedValueOnce(undefined);
      mockFindAll.mockResolvedValueOnce(restantes);
      mockUpdate.mockResolvedValue(undefined);

      await service.excluirBotaoEReordenar('b-1');

      expect(mockDelete).toHaveBeenCalledWith('b-1');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'b-2', ordem: 1 }));
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'b-3', ordem: 2 }));
    });

    it('não deve atualizar botões que já estão na ordem correta', async () => {
      const restantes = [
        makeBotao({ id: 'b-2', ordem: 1 }),
        makeBotao({ id: 'b-3', ordem: 2 }),
      ];
      mockDelete.mockResolvedValueOnce(undefined);
      mockFindAll.mockResolvedValueOnce(restantes);

      await service.excluirBotaoEReordenar('b-1');

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('moverBotao', () => {
    it('deve mover botão para cima', async () => {
      const botoes = [
        makeBotao({ id: 'b-1', ordem: 1 }),
        makeBotao({ id: 'b-2', ordem: 2 }),
      ];
      mockUpdate.mockResolvedValue(undefined);

      await service.moverBotao(botoes, 'b-2', 'up');

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'b-2', ordem: 1 }));
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'b-1', ordem: 2 }));
    });

    it('deve mover botão para baixo', async () => {
      const botoes = [
        makeBotao({ id: 'b-1', ordem: 1 }),
        makeBotao({ id: 'b-2', ordem: 2 }),
      ];
      mockUpdate.mockResolvedValue(undefined);

      await service.moverBotao(botoes, 'b-1', 'down');

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'b-1', ordem: 2 }));
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 'b-2', ordem: 1 }));
    });

    it('não deve mover quando id não for encontrado', async () => {
      const botoes = [makeBotao({ id: 'b-1', ordem: 1 })];

      await service.moverBotao(botoes, 'inexistente', 'up');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('não deve mover o primeiro botão para cima', async () => {
      const botoes = [makeBotao({ id: 'b-1', ordem: 1 })];

      await service.moverBotao(botoes, 'b-1', 'up');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('não deve mover o último botão para baixo', async () => {
      const botoes = [makeBotao({ id: 'b-1', ordem: 1 })];

      await service.moverBotao(botoes, 'b-1', 'down');

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('validarCorHex', () => {
    it('deve retornar true para cor hex válida', () => {
      expect(service.validarCorHex('#86EFAC')).toBe(true);
      expect(service.validarCorHex('#000000')).toBe(true);
      expect(service.validarCorHex('#FFFFFF')).toBe(true);
    });

    it('deve retornar false para cor hex inválida', () => {
      expect(service.validarCorHex('86EFAC')).toBe(false);
      expect(service.validarCorHex('#GGG')).toBe(false);
      expect(service.validarCorHex('#12345')).toBe(false);
      expect(service.validarCorHex('')).toBe(false);
    });
  });

  describe('garantirBotoesPadrao', () => {
    it('não deve criar botões quando já existirem botões cadastrados', async () => {
      mockFindAll.mockResolvedValueOnce([makeBotao()]);

      await service.garantirBotoesPadrao();

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('deve criar todos os botões padrão quando não houver nenhum', async () => {
      mockFindAll.mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue(undefined);

      await service.garantirBotoesPadrao();

      expect(mockCreate).toHaveBeenCalledTimes(BOTOES_PADRAO.length);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ texto: 'Sim', cor: COR_PADRAO_BOTAO, ordem: 1 }),
      );
    });
  });
});
