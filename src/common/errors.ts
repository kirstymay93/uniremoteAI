export class DeviceError extends Error {
  constructor(message: string, public readonly code = 'DEVICE_ERROR') {
    super(message);
    this.name = 'DeviceError';
  }
}
