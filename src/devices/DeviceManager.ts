import { DeviceInfo } from '../common/types';
import { SqliteStorage } from '../storage/sqliteStorage';
import { logger } from '../common/logger';

export class DeviceManager {
  private storage = new SqliteStorage();
  private devices: Map<string, DeviceInfo> = new Map();

  constructor() {
    const saved = this.storage.getDevices();
    for (const d of saved) {
      this.devices.set(d.id, d);
    }
  }

  listDevices() {
    return Array.from(this.devices.values());
  }

  registerDevice(device: DeviceInfo) {
    this.devices.set(device.id, device);
    this.storage.saveDevice(device);
    logger.info({ deviceId: device.id }, 'device registered');
  }

  getDevice(id: string): DeviceInfo | undefined {
    return this.devices.get(id);
  }

  onDeviceDiscovered(device: DeviceInfo) {
    this.registerDevice({ ...device, lastSeen: Date.now() });
  }
}
