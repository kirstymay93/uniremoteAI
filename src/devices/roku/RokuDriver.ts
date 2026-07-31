import axios from 'axios';
import { Device } from '../Device';
import { DeviceInfo, ActionResult } from '../../common/types';

export class RokuDriver implements Device {
  info: DeviceInfo;
  private baseUrl: string;
  constructor(info: DeviceInfo) {
    this.info = info;
    this.baseUrl = `http://${info.host}:${info.port || 8060}`;
  }

  async connect(): Promise<void> {
    // No persistent connection for Roku ECP; verify reachable
    await axios.get(`${this.baseUrl}/query/device-info`, { timeout: 3000 });
  }

  async disconnect(): Promise<void> {
    // nothing to do
  }

  private async post(path: string): Promise<void> {
    await axios.post(`${this.baseUrl}${path}`, null, { timeout: 3000 });
  }

  async sendKey(key: string): Promise<ActionResult> {
    try {
      await this.post(`/keypress/${encodeURIComponent(key)}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async launchApp(appId: string): Promise<ActionResult> {
    try {
      await this.post(`/launch/${encodeURIComponent(appId)}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async setVolume(level: number): Promise<ActionResult> {
    return { success: false, message: 'Volume control not supported via Roku ECP' };
  }

  async power(on: boolean): Promise<ActionResult> {
    try {
      await this.sendKey(on ? 'PowerOn' : 'PowerOff');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
}
