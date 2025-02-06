import { DefaultBuilder, ProcessorModule } from 'tools/lib/Builder.js';
import { ProjectFile } from 'tools/lib/ProjectFile.js';

type RollupOptions = { external?: string[] };

export class Processor_JavaScriptRollup implements ProcessorModule {
  builder = DefaultBuilder;
  config: string[];

  constructor({ external }: RollupOptions) {
    this.config = ['bun', 'rollup', ...(external !== undefined && external.length > 0 ? ['--external', external.join(',')] : []), '--format', 'cjs', '--stdin=js'];
  }

  async onFilesAdded(file_list: ProjectFile[]) {
    for (const file of file_list) {
      if (file.src_file.path.endsWith('.module.ts') === false) continue;

      file.processor_function_list.push(async (file) => {
        const { stderr, stdout } = Bun.spawnSync(this.config, { stdin: await file.getBytes() });
        file.setBytes(new Uint8Array(stdout));

        /**
         * Rollup writes `- → stdout...` to stderr, possibly to indicate that
         * the results can be read from stdout. To handle actual errors, we
         * simply compare the stringified bytes of stderr to the bytes that are
         * seemingly output when no errors happen. On mismatch, we write the
         * actual error text to console.
         */
        if (JSON.stringify([...stderr]) !== '[27,91,51,54,109,10,27,91,49,109,45,27,91,50,50,109,32,226,134,146,32,27,91,49,109,115,116,100,111,117,116,27,91,50,50,109,46,46,46,27,91,51,57,109,10]') {
          console.error('Error:\n', file.src_file.path);
          console.log(stderr.toString());
          console.log();
        }
      });
    }
  }
}
