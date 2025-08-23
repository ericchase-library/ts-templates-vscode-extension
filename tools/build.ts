import { BunPlatform_Argv_Includes } from '../src/lib/ericchase/BunPlatform_Argv_Includes.js';
import { NodePlatform_PathObject_Relative_Class } from '../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Step_Dev_Format } from './core-dev/step/Step_Dev_Format.js';
import { Step_Dev_Project_Update_Config } from './core-dev/step/Step_Dev_Project_Update_Config.js';
import { Builder } from './core/Builder.js';
import { Processor_Set_Writable } from './core/processor/Processor_Set_Writable.js';
import { Processor_TypeScript_Generic_Bundler } from './core/processor/Processor_TypeScript_Generic_Bundler.js';
import { Step_Bun_Run } from './core/step/Step_Bun_Run.js';
import { Step_FS_Clean_Directory } from './core/step/Step_FS_Clean_Directory.js';
import { Step_Output_Merge_Files } from './core/step/Step_Output_Merge_Files.js';
import { Processor_JavaScript_Rollup } from './lib-vscode-extension/processors/Processor_JavaScript_Rollup.js';
import { Step_VSCE_Package } from './lib-vscode-extension/steps/Step_VSCE_Package.js';

// If needed, add `cache` directory to the logger's file writer.
// await AddLoggerOutputDirectory('cache');

// Use command line arguments to set developer mode.
if (BunPlatform_Argv_Includes('--dev')) {
  Builder.SetMode(Builder.MODE.DEV);
}
// Set the logging verbosity
Builder.SetVerbosity(Builder.VERBOSITY._1_LOG);

// These steps are run during the startup phase only.
Builder.SetStartUpSteps(
  Step_Dev_Project_Update_Config({ project_dir: '.' }),
  Step_Bun_Run({ cmd: ['bun', 'update', '--latest'], showlogs: false }),
  Step_Bun_Run({ cmd: ['bun', 'install'], showlogs: false }),
  Step_FS_Clean_Directory(Builder.Dir.Out),
  //
);

// These steps are run before each processing phase.
Builder.SetBeforeProcessingSteps();

// Basic setup for a TypeScript project. TypeScript files that match
// "*.module.ts" and "*.iife.ts" are bundled and written to the out folder. The
// other TypeScript files do not produce bundles. Module scripts
// ("*.module.ts") will not bundle other module scripts. Instead, they'll
// import whatever exports are needed from other module scripts. IIFE scripts
// ("*.iife.ts"), on the other hand, produce fully contained bundles. They do
// not import anything from anywhere. Use them accordingly.

// HTML custom components are a lightweight alternative to web components made
// possible by the processor I wrote.

// The processors are run for every file that added them during every
// processing phase.

const external = [
  'vscode',
  //
];
Builder.SetProcessorModules(
  // Bundle the IIFE scripts and module scripts.
  Processor_TypeScript_Generic_Bundler({ target: 'node' }, { bundler_mode: 'iife' }),
  Processor_TypeScript_Generic_Bundler({ external, target: 'node' }, { bundler_mode: 'module' }),
  Processor_JavaScript_Rollup({ external }),
  // Write non-bundle and non-library files.
  Processor_Set_Writable({ include_patterns: ['**'], value: true }),
  //
);

// These steps are run after each processing phase.
Builder.SetAfterProcessingSteps();

// These steps are run during the cleanup phase only.
Builder.SetCleanUpSteps(
  /**
   * When continuously patching an existing extension, store its repository
   * files under `src/original-repo`. This let's you merge specific JSON and
   * text files between the original code base and yours using the
   * `Step_Output_Merge_Files` step. Then make sure to relocate the rest of the
   * original repo output folder onto the top-level output folder using the
   * `Step_FS_Move_Files` step.
   */
  // Step_Output_Merge_Files(
  //   {
  //     type: 'json',
  //     merge_files: ['original-repo/package.json', 'package.json'],
  //     out_file: 'package.json',
  //     modify: (data: any) => {
  //       /**
  //        * Note: This is effectively the only way to delete properties.
  //        */
  //       // remove the spyware
  //       delete data.contributes.configuration.properties['code-runner.enableAppInsights'];
  //       delete data.dependencies.applicationinsights;
  //       // these are for dev only
  //       delete data.devDependencies;
  //       delete data.scripts;
  //       /**
  //        * Note: You can add and modify values directly in `src/package.json`.
  //        */
  //       // make sure the main script is a relative `.js` file in posix form
  //       data.main = NodePlatform_PathObject_Relative_Class(data.main).replaceExt('.js').toPosix().join({ dot: true });
  //       // increment the original version
  //       data.version = SEMVER_UTIL.increment(data.version, 'major');
  //     },
  //   },
  //   {
  //     type: 'text',
  //     merge_files: ['CHANGELOG.md', 'original-repo/CHANGELOG.md'],
  //     out_file: 'CHANGELOG.md',
  //   },
  // ),
  // Step_FS_Move_Files({
  //   include_patterns: ['**'],
  //   from_dir: `${Builder.Dir.Out}/original-repo`,
  //   into_dir: Builder.Dir.Out,
  //   overwrite: true,
  // }),

  Step_Output_Merge_Files({
    type: 'json',
    merge_files: ['package.json'],
    out_file: 'package.json',
    modify: (data: any) => {
      // make sure the main script is a relative `.js` file in posix form
      data.main = NodePlatform_PathObject_Relative_Class(data.main).replaceExt('.js').toPosix().join({ dot: true });
    },
  }),
  Step_Dev_Format({ showlogs: false }),
  Step_VSCE_Package({ release_dir: 'release' }),
  //
);

await Builder.Start();
