export const CREATE_SERIES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  last_read_chapter_number TEXT NOT NULL
);
`;

export const CREATE_CHAPTERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY NOT NULL,
  series_id TEXT NOT NULL,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  one_line_summary TEXT NOT NULL,
  private_note TEXT,
  private_tags_json TEXT,
  is_read INTEGER NOT NULL,
  chapter_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);
`;

export const CREATE_IMPORT_LOGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS import_logs (
  id TEXT PRIMARY KEY NOT NULL,
  pack_id TEXT NOT NULL,
  series_id TEXT NOT NULL,
  pack_title TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  strategy TEXT NOT NULL,
  added_count INTEGER NOT NULL,
  updated_count INTEGER NOT NULL,
  conflict_count INTEGER NOT NULL
);
`;

export const CREATE_APP_META_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;

export const CREATE_SERIES_ACTIVITY_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS series_activity (
  series_id TEXT PRIMARY KEY NOT NULL,
  updated_at TEXT NOT NULL,
  update_source TEXT NOT NULL DEFAULT 'edit',
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);
`;

export const CREATE_SERIES_OPENED_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS series_opened (
  series_id TEXT PRIMARY KEY NOT NULL,
  opened_at TEXT NOT NULL,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);
`;

export const CREATE_MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS __migrations (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);
`;

export const SQLITE_SCHEMA_SQL = [
  CREATE_SERIES_TABLE_SQL,
  CREATE_CHAPTERS_TABLE_SQL,
  CREATE_IMPORT_LOGS_TABLE_SQL,
  CREATE_APP_META_TABLE_SQL,
  CREATE_SERIES_ACTIVITY_TABLE_SQL,
  CREATE_SERIES_OPENED_TABLE_SQL,
  CREATE_MIGRATIONS_TABLE_SQL,
];

export type Migration = {
  id: number;
  name: string;
  up: string[];
};

export const MIGRATIONS: Migration[] = [
  {
    id: 1,
    name: 'add-update-source-to-series-activity',
    up: [
      `ALTER TABLE series_activity ADD COLUMN update_source TEXT NOT NULL DEFAULT 'edit';`,
    ],
  },
  {
    id: 2,
    name: 'create-series-opened-table',
    up: [CREATE_SERIES_OPENED_TABLE_SQL],
  },
];
