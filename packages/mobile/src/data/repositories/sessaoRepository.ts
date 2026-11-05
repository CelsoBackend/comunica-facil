import { getDatabase } from '../storage';

export type SessaoRecord = {
  id: string;
  ativa: boolean;
  usuarioNome: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

type SessaoRow = {
  id: string;
  ativa: number;
  usuario_nome: string | null;
  criado_em: string;
  atualizado_em: string;
};

const mapSessaoRow = (row: SessaoRow): SessaoRecord => ({
  id: row.id,
  ativa: row.ativa === 1,
  usuarioNome: row.usuario_nome,
  criadoEm: row.criado_em,
  atualizadoEm: row.atualizado_em,
});

export class SessaoRepository {
  async save(sessao: SessaoRecord): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO SessaoApp (id, ativa, usuario_nome, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         ativa = excluded.ativa,
         usuario_nome = excluded.usuario_nome,
         atualizado_em = excluded.atualizado_em;`,
      sessao.id,
      sessao.ativa ? 1 : 0,
      sessao.usuarioNome,
      sessao.criadoEm,
      sessao.atualizadoEm,
    );
  }

  async findById(id: string): Promise<SessaoRecord | null> {
    const database = await getDatabase();
    const row = await database.getFirstAsync<SessaoRow>('SELECT * FROM SessaoApp WHERE id = ?;', id);
    return row ? mapSessaoRow(row) : null;
  }
}
