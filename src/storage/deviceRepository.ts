import type { Database } from 'better-sqlite3';
import { getDb } from './db';

export type DeviceStatus = 'DISCOVERED' | 'PAIRING_REQUIRED' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export type DeviceRecord = {
  id: string;
  name: string;
  driverId: string;
  ipAddress?: string | null;
  port?: number | null;
  capabilities: string[];
  metadata: Record<string, any> | null;
  status: DeviceStatus;
  lastSeen?: number | null;
  createdAt: number;
  updatedAt: number;
};

export class DeviceRepository {
  private db: Database;

  constructor(db?: Database) {
    this.db = db ?? getDb();
  }

  createDevice(rec: Omit<DeviceRecord, 'createdAt' | 'updatedAt'>): DeviceRecord {
    const now = Date.now();
    const stmt = this.db.prepare(`INSERT INTO devices (id, name, driver_id, ip_address, port, capabilities, metadata, status, last_seen, created_at, updated_at)
      VALUES (@id,@name,@driverId,@ipAddress,@port,@capabilities,@metadata,@status,@lastSeen,@createdAt,@updatedAt)`);
    const row = {
      ...rec,
      capabilities: JSON.stringify(rec.capabilities || []),
      metadata: rec.metadata ? JSON.stringify(rec.metadata) : null,
      lastSeen: rec.lastSeen ?? null,
      createdAt: now,
      updatedAt: now,
    };
    stmt.run({
      id: row.id,
      name: row.name,
      driverId: row.driverId,
      ipAddress: row.ipAddress,
      port: row.port,
      capabilities: row.capabilities,
      metadata: row.metadata,
      status: row.status,
      lastSeen: row.lastSeen,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
    return this.getDevice(row.id)!;
  }

  updateDevice(id: string, patch: Partial<Omit<DeviceRecord, 'id' | 'createdAt'>>): DeviceRecord | null {
    const now = Date.now();
    const existing = this.getDevice(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: now } as any;
    const stmt = this.db.prepare(`UPDATE devices SET name=@name, driver_id=@driverId, ip_address=@ipAddress, port=@port, capabilities=@capabilities, metadata=@metadata, status=@status, last_seen=@lastSeen, updated_at=@updatedAt WHERE id=@id`);
    stmt.run({
      id,
      name: updated.name,
      driverId: updated.driverId,
      ipAddress: updated.ipAddress,
      port: updated.port,
      capabilities: JSON.stringify(updated.capabilities || []),
      metadata: updated.metadata ? JSON.stringify(updated.metadata) : null,
      status: updated.status,
      lastSeen: updated.lastSeen ?? null,
      updatedAt: updated.updatedAt,
    });
    return this.getDevice(id);
  }

  deleteDevice(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM devices WHERE id=@id`);
    const info = stmt.run({ id });
    return info.changes > 0;
  }

  getDevice(id: string): DeviceRecord | null {
    const row = this.db.prepare(`SELECT * FROM devices WHERE id=@id`).get({ id });
    if (!row) return null;
    return this.rowToRecord(row);
  }

  listDevices(): DeviceRecord[] {
    const rows = this.db.prepare(`SELECT * FROM devices ORDER BY updated_at DESC`).all();
    return rows.map((r: any) => this.rowToRecord(r));
  }

  updateStatus(id: string, status: DeviceStatus): DeviceRecord | null {
    const now = Date.now();
    const stmt = this.db.prepare(`UPDATE devices SET status=@status, updated_at=@updatedAt WHERE id=@id`);
    stmt.run({ id, status, updatedAt: now });
    return this.getDevice(id);
  }

  private rowToRecord(row: any): DeviceRecord {
    return {
      id: row.id,
      name: row.name,
      driverId: row.driver_id,
      ipAddress: row.ip_address ?? null,
      port: row.port ?? null,
      capabilities: row.capabilities ? JSON.parse(row.capabilities) : [],
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      status: row.status as DeviceStatus,
      lastSeen: row.last_seen ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default DeviceRepository;
