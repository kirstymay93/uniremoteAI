import { describe, it, expect } from 'vitest';
import DeviceManager from '../src/devices/DeviceManager';
import registerDrivers from '../src/devices/registerDrivers';

describe('registerDrivers', () => {
  it('registers the Roku driver only once', () => {
    const dm = new DeviceManager();
    // first registration
    registerDrivers(dm);
    expect(dm.getRegistry().hasDriver('roku')).toBe(true);

    // second registration should be a no-op (no throw, no duplicate)
    expect(() => registerDrivers(dm)).not.toThrow();

    const drivers = dm.listDrivers().filter((d) => d.id === 'roku');
    expect(drivers.length).toBe(1);
  });
});
