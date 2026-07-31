# Drivers

This document describes the pluggable driver architecture for OmniRemote AI and explains how to add new drivers (Fire TV, Samsung, LG, Chromecast).

Driver basics
- Each driver must implement the Driver interface: src/devices/drivers/Driver.ts
- Drivers are registered at runtime via the DriverRegistry: src/devices/drivers/DriverRegistry.ts
- DeviceManager provides lifecycle helpers and a health monitor: src/devices/DeviceManager.ts

Adding a new driver

1) Create a new file under src/devices/drivers, e.g. FireTVDriver.ts
2) Export a class that implements the Driver interface. Example metadata:

{
  id: "firetv",
  name: "Amazon Fire TV Driver",
  manufacturer: "Amazon",
  version: "0.1.0",
  capabilities: ["navigation", "media", "apps"]
}

3) Implement discover() using mDNS/SSDP or platform-specific discovery.
4) Implement connect(device), disconnect(), healthCheck(), and sendCommand(device, command).
   - sendCommand should accept a normalized RemoteCommand and translate it to device-specific API calls.
5) Register the driver at startup:

import { DeviceManager } from "../../src";
import { FireTVDriver } from "./devices/drivers/FireTVDriver";

const mgr = new DeviceManager();
mgr.registerDriver(new FireTVDriver());

Driver guidelines for specific platforms

- Fire TV
  - Use ADB over TCP (if enabled) or the Fire TV remote control APIs. Provide pairing flow if needed.
  - Capabilities: navigation, media, apps, voice (optional)

- Samsung (Tizen)
  - Use the Tizen TV remote control protocol / WebSocket APIs. Some models require pairing/whitelisting.
  - Capabilities: navigation, media, apps, input

- LG (webOS)
  - Use webOS socket APIs and pairing tokens. Implement session and token storage for devices that require it.
  - Capabilities: navigation, media, apps, input

- Chromecast
  - Use the Cast V2 protocol (castv2-client is included in dependencies).
  - Capabilities: media, apps, cast

Testing and simulation

- Add unit tests under tests/drivers to validate registration and command mapping.
- Consider adding a simulated device (HTTP server) for integration tests and local development.
