import { MoveFile } from 'src/lib/ericchase/Platform/Bun/Fs.js';
import { GlobScanner } from 'src/lib/ericchase/Platform/Bun/Glob.js';
import { Path } from 'src/lib/ericchase/Platform/Node/Path.js';
import { BuildStep, DefaultBuilder } from 'tools/lib/Builder.js';

export class Step_VSCEPackage implements BuildStep {
  builder = DefaultBuilder;

  constructor(readonly package_folder: Path) {}

  async run() {
    Bun.spawnSync(['bun', 'vsce', 'package'], { cwd: this.builder.out_dir.path, stderr: 'inherit', stdout: 'inherit' });
    const package_file = [...new GlobScanner().scan(this.builder.out_dir, '*.vsix').path_groups][0];
    if (package_file) {
      await MoveFile({ from: package_file, to: this.package_folder.appendSegment(package_file.relative_path) });
    }
  }
}
