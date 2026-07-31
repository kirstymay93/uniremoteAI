import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_FILE = process.env.DEVICES_DB || path.join(process.cwd(), 'data', 'devices.db');

let db: Database.Database | null = null;

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getDb(): Database.Database {
  if (db) return db;
  ensureDir(DB_FILE);
  db = new Database(DB_FILE);
  // run migrations
  const createTable = `
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT,
      driver_id TEXT,
      ip_address TEXT,
      port INTEGER,
      capabilities TEXT,
      metadata TEXT,
      status TEXT,
      last_seen INTEGER,
      created_at INTEGER,
      updated_at INTEGER
    );
  `;
  db.exec(createTable);
  return db;
}
