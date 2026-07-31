import { describe, it, expect } from 'vitest';
import { registerDrivers } from '../../src/devices/registerDrivers';
import { driverRegistry } from '../../src/devices/drivers/DriverRegistry';
import { RokuMetadata } from '../../src/devices/drivers/RokuDriver';

describe('registerDrivers', () => {
  it('registers Roku driver into the registry', () => {
    // ensure clean state
    if (driverRegistry.hasDriver(RokuMetadata.id)) {
      driverRegistry.unregisterDriver(RokuMetadata.id);
    }

    registerDrivers();

    expect(driverRegistry.hasDriver(RokuMetadata.id)).toBe(true);
    const d = driverRegistry.getDriver(RokuMetadata.id);
    expect(d).not.toBeUndefined();
    expect(d?.id).toBe(RokuMetadata.id);
  });
});
