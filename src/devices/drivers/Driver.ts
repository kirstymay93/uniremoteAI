export type RemoteCommand = {
  command: string;
  params?: Record<string, any>;
  target?: string; // device id or address
};

export type DeviceInfo = {
  id: string;
  address: string;
  port?: number;
  metadata?: Record<string, any>;
};

export interface Driver {
  /** Unique short identifier for the driver (e.g. 'roku') */
  id: string;
  /** Human-friendly name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Semver-ish version string */
  version: string;
  /** Capability list (e.g. navigation, media, channels) */
  capabilities: string[];

  /**
   * Discover devices supported by this driver on the local network.
   * Returns an array of DeviceInfo objects.
   */
  discover(): Promise<DeviceInfo[]>;

  /**
   * Connect to a specific device. May open sockets, authenticate, etc.
   */
  connect(device: DeviceInfo): Promise<void>;

  /**
   * Disconnect / cleanup resources for a previously connected device.
   */
  disconnect(deviceId: string): Promise<void>;

  /**
   * Health check for a connected device. Should resolve true if healthy.
   */
  healthCheck(deviceId: string): Promise<boolean>;

  /**
   * Send a normalized RemoteCommand to the device.
   */
  sendCommand(deviceId: string, command: RemoteCommand): Promise<any>;
}
