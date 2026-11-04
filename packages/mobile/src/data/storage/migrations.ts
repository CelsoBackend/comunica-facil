import { getDatabase } from './database';

const DATABASE_VERSION = 1;

const MIGRATION_1 = `
CREATE TABLE IF NOT EXISTS Usuario (
  id TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL,
  senha_hash TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('paciente', 'cuidador')),
  criado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Botao (
  id TEXT PRIMARY KEY NOT NULL,
  texto TEXT NOT NULL,
  cor TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ConfiguracaoAcesso (
  id TEXT PRIMARY KEY NOT NULL,
  modo_edicao_ativo INTEGER NOT NULL DEFAULT 0,
  ultimo_acesso_cuidador_em TEXT
);
`;

export const runMigrations = async (): Promise<void> => {
  const database = await getDatabase();
  const versionRow = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion < 1) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(MIGRATION_1);
      await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    });
  }
};
