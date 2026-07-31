import { DeviceInfo, ActionResult } from '../common/types';

export interface Device {
  info: DeviceInfo;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendKey(key: string): Promise<ActionResult>;
  launchApp(appId: string): Promise<ActionResult>;
  setVolume(level: number): Promise<ActionResult>;
  power(on: boolean): Promise<ActionResult>;
}
