import { describe, it, expect, vi } from "vitest";
import axios from "axios";
import { RokuDriver, RokuMetadata } from "../src/devices/drivers/RokuDriver";
import type { DeviceInfo, RemoteCommand } from "../src/devices/drivers/Driver";

vi.mock("axios");

const mockedAxios = axios as unknown as { post: any; get: any };

describe("RokuDriver compatibility", () => {
  it("reports metadata and can connect", async () => {
    const driver = new RokuDriver();
    expect(driver.id).toBe(RokuMetadata.id);
    await driver.connect({ id: "r1", address: "127.0.0.1" });
    // health check uses axios.get; mock it to succeed
    mockedAxios.get = vi.fn().mockResolvedValue({ status: 200, data: {} });
    const ok = await driver.healthCheck("r1");
    expect(ok).toBe(true);
  });

  it("sendCommand posts to the correct path", async () => {
    const driver = new RokuDriver();
    await driver.connect({ id: "r1", address: "127.0.0.1" });
    mockedAxios.post = vi.fn().mockResolvedValue({ status: 200, data: {} });
    const res = await driver.sendCommand("r1", { command: "home" } as RemoteCommand);
    expect(mockedAxios.post).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("healthCheck returns false for unknown device", async () => {
    const driver = new RokuDriver();
    const ok = await driver.healthCheck("unknown");
    expect(ok).toBe(false);
  });
});
