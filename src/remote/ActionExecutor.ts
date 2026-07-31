import { DeviceManager } from '../devices/DeviceManager';
import { RemoteCommand } from './RemoteCommand';
import { ActionResult } from '../common/types';
import { RokuDriver } from '../devices/roku/RokuDriver';
import { trace } from '../common/tracing';
import { logger } from '../common/logger';

export class ActionExecutor {
  constructor(private deviceManager: DeviceManager) {}

  async execute(command: RemoteCommand, deviceId?: string): Promise<ActionResult> {
    await trace({ type: 'command.received', payload: { command, deviceId } });

    const deviceInfo = deviceId ? this.deviceManager.getDevice(deviceId) : this.deviceManager.listDevices()[0];
    if (!deviceInfo) {
      return { success: false, message: 'No device available' };
    }
    await trace({ type: 'device.selected', payload: deviceInfo });

    let driver;
    if (deviceInfo.type === 'roku') {
      driver = new RokuDriver(deviceInfo);
    } else {
      return { success: false, message: `Driver for ${deviceInfo.type} not implemented` };
    }

    try {
      await driver.connect();

      let result: ActionResult = { success: false, message: 'unsupported command' };
      switch (command.type) {
        case 'keypress':
          if (command.params.key) result = await driver.sendKey(command.params.key);
          break;
        case 'launch_app':
          if (command.params.appId) result = await driver.launchApp(command.params.appId);
          break;
        case 'power':
          result = await driver.power(Boolean(command.params.extra?.on));
          break;
        default:
          result = { success: false, message: 'not implemented' };
      }

      await trace({ type: 'action.executed', payload: { device: deviceInfo, command } });
      await trace({ type: 'action.result', payload: result });
      return result;
    } catch (err: any) {
      logger.error({ err }, 'action execution failed');
      return { success: false, message: err.message };
    } finally {
      await driver.disconnect();
    }
  }
}
