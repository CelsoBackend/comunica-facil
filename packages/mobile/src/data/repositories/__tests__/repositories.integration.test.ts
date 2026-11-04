import { BotaoRepository } from '../botaoRepository';
import { ConfiguracaoAcessoRepository } from '../configuracaoAcessoRepository';
import { UsuarioRepository } from '../usuarioRepository';

const mockGetDatabase = jest.fn();

jest.mock('../../storage', () => ({
  getDatabase: () => mockGetDatabase(),
}));

type MemDb = {
  runAsync: jest.Mock<Promise<void>, [string, ...unknown[]]>;
  getFirstAsync: jest.Mock<Promise<any>, [string, ...unknown[]]>;
  getAllAsync: jest.Mock<Promise<any[]>, [string, ...unknown[]]>;
};

const createMemDb = (): MemDb => {
  const usuarios: any[] = [];
  const botoes: any[] = [];
  const configuracoes = new Map<string, any>();

  const runAsync = jest.fn(async (query: string, ...args: unknown[]) => {
    if (query.includes('INSERT INTO Usuario')) {
      const [id, nome, senha_hash, tipo, criado_em] = args as [string, string, string, string, string];
      usuarios.push({ id, nome, senha_hash, tipo, criado_em });
      return;
    }

    if (query.includes('UPDATE Usuario')) {
      const [nome, senha_hash, tipo, id] = args as [string, string, string, string];
      const usuario = usuarios.find((item) => item.id === id);
      if (usuario) {
        usuario.nome = nome;
        usuario.senha_hash = senha_hash;
        usuario.tipo = tipo;
      }
      return;
    }

    if (query.includes('DELETE FROM Usuario')) {
      const [id] = args as [string];
      const index = usuarios.findIndex((item) => item.id === id);
      if (index >= 0) {
        usuarios.splice(index, 1);
      }
      return;
    }

    if (query.includes('INSERT INTO Botao')) {
      const [id, texto, cor, ordem, ativo, criado_em, atualizado_em] = args as [
        string,
        string,
        string,
        number,
        number,
        string,
        string,
      ];
      botoes.push({ id, texto, cor, ordem, ativo, criado_em, atualizado_em });
      return;
    }

    if (query.includes('UPDATE Botao')) {
      const [texto, cor, ordem, ativo, atualizado_em, id] = args as [
        string,
        string,
        number,
        number,
        string,
        string,
      ];
      const botao = botoes.find((item) => item.id === id);
      if (botao) {
        botao.texto = texto;
        botao.cor = cor;
        botao.ordem = ordem;
        botao.ativo = ativo;
        botao.atualizado_em = atualizado_em;
      }
      return;
    }

    if (query.includes('DELETE FROM Botao')) {
      const [id] = args as [string];
      const index = botoes.findIndex((item) => item.id === id);
      if (index >= 0) {
        botoes.splice(index, 1);
      }
      return;
    }

    if (query.includes('INSERT INTO ConfiguracaoAcesso')) {
      const [id, modo_edicao_ativo, ultimo_acesso_cuidador_em] = args as [string, number, string | null];
      configuracoes.set(id, { id, modo_edicao_ativo, ultimo_acesso_cuidador_em });
    }
  });

  const getFirstAsync = jest.fn(async (query: string, ...args: unknown[]) => {
    if (query.includes('SELECT * FROM Usuario WHERE id = ?')) {
      const [id] = args as [string];
      return usuarios.find((item) => item.id === id) ?? null;
    }

    if (query.includes('SELECT * FROM Usuario WHERE tipo = ?')) {
      const [tipo] = args as [string];
      const items = usuarios.filter((item) => item.tipo === tipo).sort((a, b) => a.criado_em.localeCompare(b.criado_em));
      return items[0] ?? null;
    }

    if (query.includes('SELECT COUNT(*) AS total FROM Usuario WHERE tipo = ?')) {
      const [tipo] = args as [string];
      return { total: usuarios.filter((item) => item.tipo === tipo).length };
    }

    if (query.includes('SELECT * FROM Botao WHERE id = ?')) {
      const [id] = args as [string];
      return botoes.find((item) => item.id === id) ?? null;
    }

    if (query.includes('SELECT * FROM ConfiguracaoAcesso WHERE id = ?')) {
      const [id] = args as [string];
      return configuracoes.get(id) ?? null;
    }

    return null;
  });

  const getAllAsync = jest.fn(async (query: string) => {
    if (query.includes('SELECT * FROM Usuario ORDER BY criado_em ASC')) {
      return [...usuarios].sort((a, b) => a.criado_em.localeCompare(b.criado_em));
    }

    if (query.includes('SELECT * FROM Botao')) {
      const filtrados = query.includes('WHERE ativo = 1') ? botoes.filter((item) => item.ativo === 1) : [...botoes];
      return filtrados.sort((a, b) => {
        if (a.ordem === b.ordem) {
          return a.criado_em.localeCompare(b.criado_em);
        }
        return a.ordem - b.ordem;
      });
    }

    return [];
  });

  return { runAsync, getFirstAsync, getAllAsync };
};

describe('Integração de repositórios (SQLite)', () => {
  beforeEach(() => {
    mockGetDatabase.mockReset();
    mockGetDatabase.mockResolvedValue(createMemDb());
  });

  it('deve cobrir CRUD principal de usuário e autenticação por tipo', async () => {
    const repository = new UsuarioRepository();

    await repository.create({
      id: 'u-paciente',
      nome: 'Paciente',
      senhaHash: 'hash-1',
      tipo: 'paciente',
      criadoEm: '2026-01-01T10:00:00.000Z',
    });
    await repository.create({
      id: 'u-cuidador',
      nome: 'Cuidador',
      senhaHash: 'hash-2',
      tipo: 'cuidador',
      criadoEm: '2026-01-01T10:01:00.000Z',
    });

    expect(await repository.countByTipo('cuidador')).toBe(1);
    expect(await repository.findByTipo('paciente')).toMatchObject({ id: 'u-paciente' });

    await repository.update({
      id: 'u-paciente',
      nome: 'Paciente Atualizado',
      senhaHash: 'hash-1b',
      tipo: 'paciente',
      criadoEm: '2026-01-01T10:00:00.000Z',
    });

    expect(await repository.findById('u-paciente')).toMatchObject({ nome: 'Paciente Atualizado' });

    await repository.delete('u-cuidador');
    expect(await repository.countByTipo('cuidador')).toBe(0);
  });

  it('deve cobrir CRUD principal de botão com filtro de ativos e ordenação', async () => {
    const repository = new BotaoRepository();

    await repository.create({
      id: 'b-1',
      texto: 'SIM',
      cor: '#22c55e',
      ordem: 2,
      ativo: true,
      criadoEm: '2026-01-01T10:02:00.000Z',
      atualizadoEm: '2026-01-01T10:02:00.000Z',
    });
    await repository.create({
      id: 'b-2',
      texto: 'NÃO',
      cor: '#ef4444',
      ordem: 1,
      ativo: true,
      criadoEm: '2026-01-01T10:01:00.000Z',
      atualizadoEm: '2026-01-01T10:01:00.000Z',
    });

    expect((await repository.findAll(true)).map((item) => item.id)).toEqual(['b-2', 'b-1']);

    await repository.update({
      id: 'b-2',
      texto: 'NÃO AGORA',
      cor: '#f97316',
      ordem: 3,
      ativo: false,
      criadoEm: '2026-01-01T10:01:00.000Z',
      atualizadoEm: '2026-01-01T10:03:00.000Z',
    });

    expect(await repository.findById('b-2')).toMatchObject({ texto: 'NÃO AGORA', ativo: false });
    expect((await repository.findAll(true)).map((item) => item.id)).toEqual(['b-1']);

    await repository.delete('b-1');
    expect(await repository.findById('b-1')).toBeNull();
  });

  it('deve persistir estado do modo edição e último acesso do cuidador', async () => {
    const repository = new ConfiguracaoAcessoRepository();

    await repository.save({
      id: 'principal',
      modoEdicaoAtivo: true,
      ultimoAcessoCuidadorEm: '2026-01-01T10:04:00.000Z',
    });

    expect(await repository.findById('principal')).toEqual({
      id: 'principal',
      modoEdicaoAtivo: true,
      ultimoAcessoCuidadorEm: '2026-01-01T10:04:00.000Z',
    });

    await repository.save({
      id: 'principal',
      modoEdicaoAtivo: false,
      ultimoAcessoCuidadorEm: null,
    });

    expect(await repository.findById('principal')).toEqual({
      id: 'principal',
      modoEdicaoAtivo: false,
      ultimoAcessoCuidadorEm: null,
    });
  });
});
