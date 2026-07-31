import Database from 'better-sqlite3';
import { DeviceInfo } from '../common/types';
import { config } from '../config';
import { logger } from '../common/logger';

export class SqliteStorage {
  private db: Database.Database;

  constructor(path = config.databasePath) {
    this.db = new Database(path);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        host TEXT,
        port INTEGER,
        profile TEXT,
        lastSeen INTEGER,
        metadata TEXT
      );
      CREATE TABLE IF NOT EXISTS ai_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time INTEGER,
        event TEXT
      );
    `);
  }

  saveDevice(device: DeviceInfo) {
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO devices (id,name,type,host,port,profile,lastSeen,metadata) VALUES (@id,@name,@type,@host,@port,@profile,@lastSeen,@metadata)`
    );
    stmt.run({
      ...device,
      metadata: device.metadata ? JSON.stringify(device.metadata) : null
    });
    logger.info({ deviceId: device.id }, 'device saved');
  }

  getDevices(): DeviceInfo[] {
    const rows = this.db.prepare('SELECT * FROM devices').all();
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      host: r.host,
      port: r.port,
      profile: r.profile,
      lastSeen: r.lastSeen,
      metadata: r.metadata ? JSON.parse(r.metadata) : undefined
    }));
  }
}
