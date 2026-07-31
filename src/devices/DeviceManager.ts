import type { Driver } from "./drivers/Driver";
import type { DeviceRecord, DeviceRepository } from "../storage/deviceRepository";
import { driverRegistry } from "./drivers/DriverRegistry";
import DeviceRepositoryImpl from "../storage/deviceRepository";
import type { DeviceInfo, RemoteCommand } from "./drivers/Driver";

export class DeviceManager {
  private registry = driverRegistry;
  private repo: DeviceRepositoryImpl;
  private healthIntervalMs = 30_000;
  private healthTimer: NodeJS.Timeout | null = null;
  // runtime connection state (not persisted)
  private connections: Map<string, { driverId: string; connected: boolean }> = new Map();

  constructor(repo?: DeviceRepositoryImpl) {
    this.repo = repo ?? new DeviceRepositoryImpl();
    // load persisted devices into runtime map (mark disconnected by default)
    for (const d of this.repo.listDevices()) {
      this.connections.set(d.id, { driverId: d.driverId, connected: false });
    }
  }

  getRegistry() {
    return this.registry;
  }

  registerDriver(driver: Driver): void {
    this.registry.registerDriver(driver);
  }

  unregisterDriver(id: string): void {
    this.registry.unregisterDriver(id);
  }

  listDrivers(): Driver[] {
    return this.registry.listDrivers();
  }

  getDriver(id: string): Driver | undefined {
    return this.registry.getDriver(id);
  }

  findDriversByCapability(capability: string): Driver[] {
    return this.registry.listDrivers().filter((d) => d.capabilities.includes(capability));
  }

  // Device persistence / queries
  listDevices(): DeviceRecord[] {
    return this.repo.listDevices();
  }

  getDevice(id: string): DeviceRecord | null {
    return this.repo.getDevice(id);
  }

  async connectDevice(id: string): Promise<DeviceRecord> {
    const rec = this.repo.getDevice(id);
    if (!rec) throw new Error("device_not_found");
    const driver = this.registry.getDriver(rec.driverId);
    if (!driver) throw new Error("driver_not_found");

    // attempt to connect via driver
    const info: DeviceInfo = {
      id: rec.id,
      address: rec.ipAddress ?? '',
      port: rec.port ?? undefined,
      metadata: rec.metadata ?? undefined,
    };

    await driver.connect(info);
    this.connections.set(rec.id, { driverId: rec.driverId, connected: true });
    const updated = this.repo.updateStatus(rec.id, 'CONNECTED');
    return updated!;
  }

  async disconnectDevice(id: string): Promise<DeviceRecord> {
    const rec = this.repo.getDevice(id);
    if (!rec) throw new Error("device_not_found");
    const driver = this.registry.getDriver(rec.driverId);
    if (!driver) throw new Error("driver_not_found");

    await driver.disconnect(rec.id);
    this.connections.set(rec.id, { driverId: rec.driverId, connected: false });
    const updated = this.repo.updateStatus(rec.id, 'DISCONNECTED');
    return updated!;
  }

  async sendCommandToDeviceById(deviceId: string, command: RemoteCommand): Promise<any> {
    const rec = this.repo.getDevice(deviceId);
    if (!rec) throw new Error("device_not_found");
    const driver = this.registry.getDriver(rec.driverId);
    if (!driver) throw new Error("driver_not_found");
    return driver.sendCommand(deviceId, command);
  }

  startHealthMonitor(intervalMs?: number): void {
    if (intervalMs) this.healthIntervalMs = intervalMs;
    if (this.healthTimer) return;

    this.healthTimer = setInterval(async () => {
      for (const driver of this.registry.listDrivers()) {
        try {
          const ok = await driver.healthCheck("*");
          if (!ok) {
            // eslint-disable-next-line no-console
            console.warn(`Driver ${driver.id} reported unhealthy`);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(`Health check failed for driver ${driver.id}:`, err);
        }
      }
    }, this.healthIntervalMs);
  }

  stopHealthMonitor(): void {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
  }
}

export default DeviceManager;
