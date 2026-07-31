import type DeviceManager from './DeviceManager';
import RokuDriver from './drivers/RokuDriver';

export default function registerDrivers(deviceManager: DeviceManager): void {
  // avoid duplicate registration
  const registry = deviceManager.getRegistry();
  if (registry.hasDriver('roku')) return;

  const roku = new RokuDriver();
  deviceManager.registerDriver(roku);
}
