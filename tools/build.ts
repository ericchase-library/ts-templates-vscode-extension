import { Path } from 'src/lib/ericchase/Platform/Node/Path.js';
import { Builder } from 'tools/lib/Builder.js';
import { Processor_IOBasicWriter } from 'tools/lib/processors/IO-Basic-Writer.js';
import { Processor_TypeScriptGenericBundler } from 'tools/lib/processors/TypeScript-Generic-Bundler.js';
import { Processor_TypeScriptImportRemapper } from 'tools/lib/processors/TypeScript-Import-Remapper.js';
import { Step_CleanDirectory } from 'tools/lib/steps/Clean-Directory.js';
import { Step_Format } from 'tools/lib/steps/Format.js';
import { Processor_JavaScriptRollup } from 'tools/processors/JavaScript-Rollup.js';
import { Step_VSCEPackage } from 'tools/steps/VSCE-Package.js';

const builder = new Builder({});

builder.setPreBuildSteps(
  //
  new Step_CleanDirectory([builder.out_dir]),
  new Step_Format(),
);

builder.setProcessorModules(
  //
  new Processor_TypeScriptGenericBundler({ external: ['vscode'], sourcemap: 'none', target: 'node' }),
  new Processor_TypeScriptImportRemapper(),
  new Processor_JavaScriptRollup({ external: ['vscode'] }),
  new Processor_IOBasicWriter(),
);

builder.setPostBuildSteps(
  //
  new Step_VSCEPackage(new Path('./release')),
);

await builder.start();
