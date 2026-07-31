import { RemoteCommand } from '../remote/RemoteCommand';
import { ActionExecutor } from '../remote/ActionExecutor';

export class SceneManager {
  constructor(private executor: ActionExecutor) {}

  async runScene(actions: { command: RemoteCommand; deviceId?: string }[]) {
    for (const a of actions) {
      await this.executor.execute(a.command, a.deviceId);
    }
  }
}
