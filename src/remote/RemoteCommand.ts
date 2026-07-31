export type RemoteActionType =
  | 'navigate'
  | 'keypress'
  | 'volume'
  | 'power'
  | 'launch_app'
  | 'media';

export interface RemoteCommandParams {
  key?: string;
  volume?: number;
  appId?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'ok';
  extra?: Record<string, any>;
}

export class RemoteCommand {
  constructor(public type: RemoteActionType, public params: RemoteCommandParams = {}) {}

  static fromIntent(intent: string, parameters: any) {
    switch (intent) {
      case 'open_app':
        return new RemoteCommand('launch_app', { appId: parameters.app || parameters.appId });
      case 'volume_down':
        return new RemoteCommand('volume', { volume: parameters.level ?? -1 });
      case 'press_key':
        return new RemoteCommand('keypress', { key: parameters.key });
      default:
        return new RemoteCommand('keypress', { key: 'InputSelect' });
    }
  }
}
