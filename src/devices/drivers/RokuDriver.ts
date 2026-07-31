import type { Driver, DeviceInfo, RemoteCommand } from '../drivers/Driver';

export default class RokuDriver implements Driver {
  id = 'roku';
  name = 'Roku Driver';
  manufacturer = 'Roku';
  version = '0.1.0';
  capabilities = ['media', 'remote'];

  async discover(): Promise<DeviceInfo[]> {
    // discovery not implemented yet
    return [];
  }

  async connect(device: DeviceInfo): Promise<void> {
    // no-op for now; real implementation would open sockets/auth
    return;
  }

  async disconnect(deviceId: string): Promise<void> {
    // no-op for now
    return;
  }

  async healthCheck(deviceId: string): Promise<boolean> {
    // basic stub returns healthy
    return true;
  }

  async sendCommand(deviceId: string, command: RemoteCommand): Promise<any> {
    // stubbed response
    return { ok: true };
  }
}
