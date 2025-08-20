import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { Step_Bun_Run } from '../../core/step/Step_Bun_Run.js';

export function Step_NPM_Install_Extension_Dependencies(): Builder.Step {
  return new Class();
}
class Class implements Builder.Step {
  StepName = Step_NPM_Install_Extension_Dependencies.name;
  channel = Logger(this.StepName).newChannel();

  async onRun(): Promise<void> {
    await Builder.ExecuteStep(Step_Bun_Run({ cmd: ['npm', 'install', '--omit=dev'], dir: Builder.Dir.Out }));
  }
}
