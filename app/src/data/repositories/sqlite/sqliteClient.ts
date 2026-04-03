import * as SQLite from 'expo-sqlite';

import { SQLITE_SCHEMA_SQL } from './schema';
import { SqliteDatabaseLike } from './types';

const DATABASE_NAME = 'comiclog.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const ensureDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
};

export const getSqliteDatabase = async (): Promise<SqliteDatabaseLike> => {
  const database = await ensureDatabase();

  await database.execAsync('PRAGMA foreign_keys = ON;');
  for (const schemaSql of SQLITE_SCHEMA_SQL) {
    await database.execAsync(schemaSql);
  }

  return database as unknown as SqliteDatabaseLike;
};
