import { TipoUsuario } from '@/domain/entities';

import { getDatabase } from '../storage';

export type UsuarioRecord = {
  id: string;
  nome: string;
  senhaHash: string;
  tipo: TipoUsuario;
  criadoEm: string;
};

type UsuarioRow = {
  id: string;
  nome: string;
  senha_hash: string;
  tipo: TipoUsuario;
  criado_em: string;
};

const mapUsuarioRow = (row: UsuarioRow): UsuarioRecord => ({
  id: row.id,
  nome: row.nome,
  senhaHash: row.senha_hash,
  tipo: row.tipo,
  criadoEm: row.criado_em,
});

export class UsuarioRepository {
  async create(usuario: UsuarioRecord): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO Usuario (id, nome, senha_hash, tipo, criado_em)
       VALUES (?, ?, ?, ?, ?);`,
      usuario.id,
      usuario.nome,
      usuario.senhaHash,
      usuario.tipo,
      usuario.criadoEm,
    );
  }

  async findById(id: string): Promise<UsuarioRecord | null> {
    const database = await getDatabase();
    const row = await database.getFirstAsync<UsuarioRow>('SELECT * FROM Usuario WHERE id = ?;', id);
    return row ? mapUsuarioRow(row) : null;
  }

  async findAll(): Promise<UsuarioRecord[]> {
    const database = await getDatabase();
    const rows = await database.getAllAsync<UsuarioRow>('SELECT * FROM Usuario ORDER BY criado_em ASC;');
    return rows.map(mapUsuarioRow);
  }

  async findByTipo(tipo: TipoUsuario): Promise<UsuarioRecord | null> {
    const database = await getDatabase();
    const row = await database.getFirstAsync<UsuarioRow>(
      'SELECT * FROM Usuario WHERE tipo = ? ORDER BY criado_em ASC LIMIT 1;',
      tipo,
    );
    return row ? mapUsuarioRow(row) : null;
  }

  async countByTipo(tipo: TipoUsuario): Promise<number> {
    const database = await getDatabase();
    const row = await database.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) AS total FROM Usuario WHERE tipo = ?;',
      tipo,
    );
    return row?.total ?? 0;
  }

  async update(usuario: UsuarioRecord): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE Usuario
         SET nome = ?, senha_hash = ?, tipo = ?
       WHERE id = ?;`,
      usuario.nome,
      usuario.senhaHash,
      usuario.tipo,
      usuario.id,
    );
  }

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM Usuario WHERE id = ?;', id);
  }
}
