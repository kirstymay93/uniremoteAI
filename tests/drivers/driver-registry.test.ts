import { describe, it, expect, vi } from "vitest";
import { DriverRegistry } from "../src/devices/drivers/DriverRegistry";
import type { Driver } from "../src/devices/drivers/Driver";
import type { DeviceInfo, RemoteCommand } from "../src/devices/drivers/Driver";

const makeMockDriver = (id: string): Driver => {
  return {
    id,
    name: `mock-${id}`,
    manufacturer: "unit-test",
    version: "0.0.1",
    capabilities: ["test"],
    async discover() {
      return [];
    },
    async connect(_device: DeviceInfo) {},
    async disconnect(_deviceId: string) {},
    async healthCheck(_deviceId: string) {
      return true;
    },
    async sendCommand(_deviceId: string, _command: RemoteCommand) {
      return { ok: true };
    },
  };
};

describe("DriverRegistry", () => {
  it("registers and exposes drivers", () => {
    const reg = new DriverRegistry();
    const d = makeMockDriver("alpha");
    reg.registerDriver(d);
    expect(reg.hasDriver("alpha")).toBe(true);
    const fetched = reg.getDriver("alpha");
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe("alpha");
    expect(reg.listDrivers().length).toBe(1);
  });

  it("prevents duplicate registrations", () => {
    const reg = new DriverRegistry();
    const d = makeMockDriver("dup");
    reg.registerDriver(d);
    expect(() => reg.registerDriver(d)).toThrow();
  });

  it("unregisters drivers", () => {
    const reg = new DriverRegistry();
    const d = makeMockDriver("to-remove");
    reg.registerDriver(d);
    expect(reg.hasDriver("to-remove")).toBe(true);
    reg.unregisterDriver("to-remove");
    expect(reg.hasDriver("to-remove")).toBe(false);
  });
});
