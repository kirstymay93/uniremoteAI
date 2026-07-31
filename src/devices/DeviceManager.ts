import type { Driver } from "./drivers/Driver";
import type { DeviceInfo } from "./drivers/Driver";
import { driverRegistry } from "./drivers/DriverRegistry";

export class DeviceManager {
  private registry = driverRegistry;
  private healthIntervalMs = 30_000;
  private healthTimer: NodeJS.Timeout | null = null;

  constructor() {}

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

  startHealthMonitor(intervalMs?: number): void {
    if (intervalMs) this.healthIntervalMs = intervalMs;
    if (this.healthTimer) return;

    this.healthTimer = setInterval(async () => {
      for (const driver of this.registry.listDrivers()) {
        try {
          // For each driver, attempt to health check all known devices.
          // Drivers are responsible for managing their connected device list.
          // We call healthCheck with a special '*' to indicate a driver-wide check if supported.
          // If driver's healthCheck requires device ids, drivers should implement their own iteration.
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

  async sendCommand(driverId: string, deviceId: string, command: any): Promise<any> {
    const driver = this.getDriver(driverId);
    if (!driver) throw new Error(`Driver '${driverId}' not found`);
    return driver.sendCommand(deviceId, command);
  }
}

export default DeviceManager;
