import { getDatabase } from '../storage';

export type ConfiguracaoAcessoRecord = {
  id: string;
  modoEdicaoAtivo: boolean;
  ultimoAcessoCuidadorEm: string | null;
};

type ConfiguracaoAcessoRow = {
  id: string;
  modo_edicao_ativo: number;
  ultimo_acesso_cuidador_em: string | null;
};

const mapConfiguracaoAcessoRow = (row: ConfiguracaoAcessoRow): ConfiguracaoAcessoRecord => ({
  id: row.id,
  modoEdicaoAtivo: row.modo_edicao_ativo === 1,
  ultimoAcessoCuidadorEm: row.ultimo_acesso_cuidador_em,
});

export class ConfiguracaoAcessoRepository {
  async save(configuracao: ConfiguracaoAcessoRecord): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO ConfiguracaoAcesso (id, modo_edicao_ativo, ultimo_acesso_cuidador_em)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         modo_edicao_ativo = excluded.modo_edicao_ativo,
         ultimo_acesso_cuidador_em = excluded.ultimo_acesso_cuidador_em;`,
      configuracao.id,
      configuracao.modoEdicaoAtivo ? 1 : 0,
      configuracao.ultimoAcessoCuidadorEm,
    );
  }

  async findById(id: string): Promise<ConfiguracaoAcessoRecord | null> {
    const database = await getDatabase();
    const row = await database.getFirstAsync<ConfiguracaoAcessoRow>(
      'SELECT * FROM ConfiguracaoAcesso WHERE id = ?;',
      id,
    );
    return row ? mapConfiguracaoAcessoRow(row) : null;
  }
}
