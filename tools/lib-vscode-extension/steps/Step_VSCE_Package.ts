import { Async_BunPlatform_File_Move } from '../../../src/lib/ericchase/BunPlatform_File_Move.js';
import { Async_BunPlatform_File_Read_Text } from '../../../src/lib/ericchase/BunPlatform_File_Read_Text.js';
import { Async_BunPlatform_File_Write_Text } from '../../../src/lib/ericchase/BunPlatform_File_Write_Text.js';
import { Async_BunPlatform_Glob_Scan_Generator } from '../../../src/lib/ericchase/BunPlatform_Glob_Scan_Generator.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { Step_Bun_Run } from '../../core/step/Step_Bun_Run.js';

export function Step_VSCE_Package(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_VSCE_Package.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly config: Config) {}
  async onStartUp(): Promise<void> {
    this.config.entrypoint ??= 'extension.module.js';
  }
  async onRun(): Promise<void> {
    if (this.config.entrypoint === undefined) {
      throw new Error('Property "config.entrypoint" is undefined. Did you attempt to call the "onRun" method directly? Use "Builder.ExecuteStep" instead.');
    }
    // write empty .vscodeignore file, as we don't need it
    await Async_BunPlatform_File_Write_Text(NODE_PATH.join(Builder.Dir.Out, '.vscodeignore'), '');
    // remove "scripts" and "devDependencies" properties from package.json
    const { error, value: text } = await Async_BunPlatform_File_Read_Text(NODE_PATH.join(Builder.Dir.Out, 'package.json'));
    if (text !== undefined) {
      const package_json = JSON.parse(text);
      delete package_json.scripts;
      delete package_json.devDependencies;
      package_json.main = NodePlatform_PathObject_Relative_Class(this.config.entrypoint).replaceExt('.js').toPosix().join({ dot: true });
      await Async_BunPlatform_File_Write_Text(NODE_PATH.join(Builder.Dir.Out, 'package.json'), JSON.stringify(package_json, null, 2));
    } else {
      throw error;
    }
    await Builder.ExecuteStep(Step_Bun_Run({ cmd: ['bun', 'run', 'vsce', 'package'], dir: Builder.Dir.Out }));
    for await (const path of Async_BunPlatform_Glob_Scan_Generator(Builder.Dir.Out, '*.vsix')) {
      await Async_BunPlatform_File_Move(NODE_PATH.join(Builder.Dir.Out, path), NODE_PATH.join(this.config.release_dirpath, path), true);
    }
  }
}
interface Config {
  release_dirpath: string;
  /** @default "extension.module.js" */
  entrypoint?: string;
}
