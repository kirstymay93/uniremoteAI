import type { Driver } from "./Driver";

/**
 * Simple registry for drivers. Drivers are registered by their `id`.
 */
export class DriverRegistry {
  private drivers: Map<string, Driver> = new Map();

  registerDriver(driver: Driver): void {
    if (this.drivers.has(driver.id)) {
      throw new Error(`Driver with id '${driver.id}' is already registered`);
    }
    this.drivers.set(driver.id, driver);
  }

  unregisterDriver(id: string): void {
    this.drivers.delete(id);
  }

  getDriver(id: string): Driver | undefined {
    return this.drivers.get(id);
  }

  listDrivers(): Driver[] {
    return Array.from(this.drivers.values());
  }

  hasDriver(id: string): boolean {
    return this.drivers.has(id);
  }
}

// Export a default singleton to simplify use in the codebase
export const driverRegistry = new DriverRegistry();
