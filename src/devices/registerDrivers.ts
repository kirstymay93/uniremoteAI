import { driverRegistry } from './drivers/DriverRegistry';
import { RokuDriver, RokuMetadata } from './drivers/RokuDriver';
import type DeviceManager from './DeviceManager';

export function registerDrivers(mgr?: DeviceManager) {
  // Register known drivers into the central registry or via DeviceManager if provided.
  const roku = new RokuDriver();
  if (mgr && typeof mgr.registerDriver === 'function') {
    mgr.registerDriver(roku as any);
  } else {
    driverRegistry.registerDriver(roku);
  }

  // Future drivers can be instantiated and registered here:
  // driverRegistry.registerDriver(new FireTVDriver());
  // driverRegistry.registerDriver(new AndroidTVDriver());
}

export default registerDrivers;
