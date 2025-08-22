import { BunPlatform_Argv_Includes } from '../src/lib/ericchase/BunPlatform_Argv_Includes.js';
import { NODE_PATH } from '../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Directory_Delete } from '../src/lib/ericchase/NodePlatform_Directory_Delete.js';
import { Step_Dev_Format } from './core-dev/step/Step_Dev_Format.js';
import { Step_Dev_Project_Update_Config } from './core-dev/step/Step_Dev_Project_Update_Config.js';
import { Builder } from './core/Builder.js';
import { Processor_Set_Writable } from './core/processor/Processor_Set_Writable.js';
import { Processor_TypeScript_Generic_Bundler } from './core/processor/Processor_TypeScript_Generic_Bundler.js';
import { Step_Bun_Run } from './core/step/Step_Bun_Run.js';
import { Step_FS_Clean_Directory } from './core/step/Step_FS_Clean_Directory.js';
import { Processor_JavaScript_Rollup } from './lib-vscode-extension/processors/Processor_JavaScript_Rollup.js';
import { Step_VSCE_Package } from './lib-vscode-extension/steps/Step_VSCE_Package.js';

// If needed, add `cache` directory to the logger's file writer.
// await AddLoggerOutputDirectory('cache');

// Delete server lib folder because it's not useful for VSCode extensions.
await Async_NodePlatform_Directory_Delete(NODE_PATH.join(Builder.Dir.Lib, 'server'), true);

// Use command line arguments to set developer mode.
if (BunPlatform_Argv_Includes('--dev')) {
  Builder.SetMode(Builder.MODE.DEV);
}
// Set the logging verbosity
Builder.SetVerbosity(Builder.VERBOSITY._1_LOG);

// These steps are run during the startup phase only.
Builder.SetStartUpSteps(
  Step_Dev_Project_Update_Config({ project_path: '.' }),
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
  /** Flatten the out folder for original repo. Useful for patching existing
   * extensions. */
  // Step_Flatten_OriginalRepo_OutDir({ original_subdir: 'original-repo', merge_list: ['package.json', 'CHANGELOG.md', 'README.md'] }),

  Step_Dev_Format({ showlogs: false }),
  Step_VSCE_Package({ entrypoint: 'extension.module.ts', release_dirpath: 'release' }),
  //
);

await Builder.Start();
