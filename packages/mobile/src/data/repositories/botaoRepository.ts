import { getDatabase } from '../storage';

export type BotaoEntity = {
  id: string;
  texto: string;
  cor: string;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

type BotaoRow = {
  id: string;
  texto: string;
  cor: string;
  ordem: number;
  ativo: number;
  criado_em: string;
  atualizado_em: string;
};

const mapBotaoRow = (row: BotaoRow): BotaoEntity => ({
  id: row.id,
  texto: row.texto,
  cor: row.cor,
  ordem: row.ordem,
  ativo: row.ativo === 1,
  criadoEm: row.criado_em,
  atualizadoEm: row.atualizado_em,
});

export class BotaoRepository {
  async create(botao: BotaoEntity): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO Botao (id, texto, cor, ordem, ativo, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      botao.id,
      botao.texto,
      botao.cor,
      botao.ordem,
      botao.ativo ? 1 : 0,
      botao.criadoEm,
      botao.atualizadoEm,
    );
  }

  async findById(id: string): Promise<BotaoEntity | null> {
    const database = await getDatabase();
    const row = await database.getFirstAsync<BotaoRow>('SELECT * FROM Botao WHERE id = ?;', id);
    return row ? mapBotaoRow(row) : null;
  }

  async findAll(activeOnly = false): Promise<BotaoEntity[]> {
    const database = await getDatabase();
    const query = activeOnly
      ? 'SELECT * FROM Botao WHERE ativo = 1 ORDER BY ordem ASC, criado_em ASC;'
      : 'SELECT * FROM Botao ORDER BY ordem ASC, criado_em ASC;';
    const rows = await database.getAllAsync<BotaoRow>(query);
    return rows.map(mapBotaoRow);
  }

  async update(botao: BotaoEntity): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE Botao
         SET texto = ?, cor = ?, ordem = ?, ativo = ?, atualizado_em = ?
       WHERE id = ?;`,
      botao.texto,
      botao.cor,
      botao.ordem,
      botao.ativo ? 1 : 0,
      botao.atualizadoEm,
      botao.id,
    );
  }

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM Botao WHERE id = ?;', id);
  }
}
