import { CPath, Path } from '../src/lib/ericchase/Platform/FilePath.js';
import { Logger } from '../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from './lib/Builder.js';
import { Step_Bun_Run } from './lib/steps/Bun-Run.js';

const logger = Logger(Step_VSCE_Package.name);

export function Step_VSCE_Package(release_dirpath: CPath | string): Step {
  return new CStep_VSCE_Package(Path(release_dirpath));
}

class CStep_VSCE_Package implements Step {
  channel = logger.newChannel();

  constructor(readonly release_dirpath: CPath) {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    await Step_Bun_Run({ cmd: ['vsce', 'package'], dir: builder.dir.out }).run(builder);

    // const package_file = [...new GlobScanner().scan(builder.dir.out, '*.vsix').path_groups][0];
    // if (package_file) {
    //   await MoveFile({ from: package_file, to: package_folder.appendSegment(package_file.relative_path) });
    // }
  }
}
