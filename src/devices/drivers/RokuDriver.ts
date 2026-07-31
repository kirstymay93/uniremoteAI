import type { Driver, DeviceInfo, RemoteCommand } from "./Driver";
import axios from "axios";

export const RokuMetadata = {
  id: "roku",
  name: "Roku ECP Driver",
  manufacturer: "Roku",
  version: "1.0.0",
  capabilities: ["navigation", "keyboard", "media", "channels"],
} as const;

export class RokuDriver implements Driver {
  readonly id = RokuMetadata.id;
  readonly name = RokuMetadata.name;
  readonly manufacturer = RokuMetadata.manufacturer;
  readonly version = RokuMetadata.version;
  readonly capabilities = RokuMetadata.capabilities;

  private devices: Map<string, DeviceInfo> = new Map();

  constructor() {}

  async discover(): Promise<DeviceInfo[]> {
    // Placeholder: real discovery would use SSDP/mDNS. Keep non-blocking.
    return [];
  }

  async connect(device: DeviceInfo): Promise<void> {
    if (!device || !device.id) throw new Error("Invalid device");
    this.devices.set(device.id, device);
  }

  async disconnect(deviceId: string): Promise<void> {
    this.devices.delete(deviceId);
  }

  async healthCheck(deviceId: string): Promise<boolean> {
    // If deviceId is '*', run a driver-wide health check by pinging all known devices.
    try {
      if (deviceId === "*") {
        for (const d of this.devices.values()) {
          try {
            await axios.get(`http://${d.address}/query/device-info`, { timeout: 2000 });
          } catch (e) {
            return false;
          }
        }
        return true;
      }

      const dev = this.devices.get(deviceId);
      if (!dev) return false;
      await axios.get(`http://${dev.address}/query/device-info`, { timeout: 2000 });
      return true;
    } catch (err) {
      return false;
    }
  }

  async sendCommand(deviceId: string, command: RemoteCommand): Promise<any> {
    const dev = this.devices.get(deviceId);
    if (!dev) throw new Error("Unknown device");
    if (!dev.address) throw new Error("Device has no address");

    const mapping: Record<string, string> = {
      up: "Up",
      down: "Down",
      left: "Left",
      right: "Right",
      select: "Select",
      back: "Back",
      home: "Home",
      play: "Play",
      pause: "Play",
      "lit_letter": "Lit_*",
    };

    const cmdName = (command.command ?? "").toLowerCase();
    const rokuKey = mapping[cmdName] ?? command.command;

    const url = `http://${dev.address}/keypress/${encodeURIComponent(rokuKey)}`;

    try {
      const res = await axios.post(url, null, { timeout: 2000 });
      return { status: res.status, data: res.data };
    } catch (err: any) {
      throw new Error(`Failed to send command to Roku: ${err?.message ?? String(err)}`);
    }
  }
}

export default RokuDriver;
