import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'comunica-facil.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
};
