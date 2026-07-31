import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { DeviceRepository, DeviceRecord } from '../../src/storage/deviceRepository';

const TMP_DB = path.join(process.cwd(), 'data', 'test-devices.db');

function makeDb() {
  if (fs.existsSync(TMP_DB)) fs.unlinkSync(TMP_DB);
  const db = new Database(TMP_DB);
  db.exec(`
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
  `);
  return db;
}

describe('DeviceRepository', () => {
  let repo: DeviceRepository;
  beforeEach(() => {
    const db = makeDb();
    repo = new DeviceRepository(db as any);
  });

  it('creates and retrieves a device', () => {
    const rec = repo.createDevice({
      id: 'd1',
      name: 'Test Device',
      driverId: 'roku',
      ipAddress: '127.0.0.1',
      port: 8060,
      capabilities: ['media'],
      metadata: { model: 'RokuTest' },
      status: 'DISCOVERED',
    });

    expect(rec.id).toBe('d1');
    const got = repo.getDevice('d1');
    expect(got).not.toBeNull();
    expect(got?.driverId).toBe('roku');
  });

  it('updates a device', () => {
    repo.createDevice({
      id: 'd2',
      name: 'Device2',
      driverId: 'roku',
      ipAddress: '10.0.0.2',
      port: 8060,
      capabilities: ['media'],
      metadata: null,
      status: 'DISCOVERED',
    });

    const updated = repo.updateDevice('d2', { name: 'Device2-New', status: 'CONNECTED' });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Device2-New');
    expect(updated?.status).toBe('CONNECTED');
  });

  it('lists devices', () => {
    repo.createDevice({ id: 'd3', name: 'D3', driverId: 'roku', capabilities: [], metadata: null, status: 'DISCOVERED' });
    repo.createDevice({ id: 'd4', name: 'D4', driverId: 'roku', capabilities: [], metadata: null, status: 'DISCOVERED' });
    const list = repo.listDevices();
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it('deletes a device', () => {
    repo.createDevice({ id: 'd5', name: 'D5', driverId: 'roku', capabilities: [], metadata: null, status: 'DISCOVERED' });
    const ok = repo.deleteDevice('d5');
    expect(ok).toBe(true);
    const got = repo.getDevice('d5');
    expect(got).toBeNull();
  });
});
