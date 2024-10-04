import { Broadcast } from '../../src/lib/ericchase/Design Pattern/Observer/Broadcast.js';
import { Run, RunSync } from '../../src/lib/ericchase/Platform/Bun/Child Process.js';
import { CopyFile } from '../../src/lib/ericchase/Platform/Bun/Fs.js';
import { GlobScanner } from '../../src/lib/ericchase/Platform/Bun/Glob.js';
import { CleanDirectory } from '../../src/lib/ericchase/Platform/Node/Fs.js';
import { Path } from '../../src/lib/ericchase/Platform/Node/Path.js';
import { ConsoleLogWithDate, ConsoleNewline } from '../../src/lib/ericchase/Utility/Console.js';
import { command_map } from '../dev.js';
import { BuildRunner, copy, IntoPatterns } from '../lib/build.js';
import { Cache_FileStats_Lock, Cache_FileStats_Reset, Cache_FileStats_Unlock } from '../lib/cache/FileStatsCache.js';
import { Cache_Unlock, TryLock, TryLockEach } from '../lib/cache/LockCache.js';

// user config
const source_extensions = ['.ts']; // extensions for source files for building
const module_suffixes = ['.module']; // for build: external
const external_npm_imports = ['vscode']; // don't add these packages to the bundle

// directories
export const out_dir = new Path('build'); // final extension files will appear here
export const src_dir = new Path('src'); // all extension files go here
export const lib_dir = new Path('lib'); // for exclusions
export const pkg_dir = new Path('release'); // final extension packages will appear here

// temp directories
export const tmp_dir = out_dir.newBase(`${out_dir.base}_temp`); // temp folder for build process

// computed patterns
const source_patterns = IntoPatterns('**/*', source_extensions); // for build
const module_patterns = IntoPatterns('**/*', module_suffixes, source_extensions); // for build
const module_output_patterns = IntoPatterns('**/*', module_suffixes, '.js'); // for build
const external_import_patterns = IntoPatterns('*', module_suffixes, '.js'); // for build: external
const lib_patterns = [lib_dir.appendSegment('**/*').standard_path];

// build mode
export const build_mode = {
  archive: false,
  silent: false,
  watch: false,
};

// bundler
const bundler = new BuildRunner();
bundler.broadcast.subscribe(() => {
  for (const line of bundler.output) {
    if (line.length > 0) {
      onLog(`bund: ${line}`);
    }
  }
  bundler.output = [];
});

// step: clean
export async function buildStep_Clean() {
  bundler.killAll();
  Cache_FileStats_Reset();
  await CleanDirectory(out_dir);
  await CleanDirectory(tmp_dir);
}

// step: setup rollup
let rollup_unsubscribe = () => {};
export async function buildStep_SetupRollup() {
  rollup_unsubscribe();
  rollup_unsubscribe = bundler.broadcast.subscribe(async () => {
    const tasks: Promise<number>[] = [];
    for (const entry of new GlobScanner().scan(tmp_dir, ...module_output_patterns).path_groups) {
      tasks.push(Run.Bun('rollup', entry.path, '--external', 'vscode', '--file', entry.newOrigin(out_dir).path, '--format', 'cjs').exited);
    }
    await Promise.allSettled(tasks);
  });
}

// step: setup bundler
export async function buildStep_SetupBundler() {
  const external = [...external_import_patterns, ...external_npm_imports];
  const watch = build_mode.watch;
  // modules
  for (const entry of new GlobScanner().scan(src_dir, ...module_patterns).path_groups) {
    bundler.add({ entrypoint: entry, outdir: tmp_dir, external, watch });
  }
  if (build_mode.watch === false) {
    await Promise.allSettled([...bundler.subprocess_map].map(([_, process]) => process.exited));
  }
}

// step: copy
export async function buildStep_Copy() {
  const src_copied_paths = await copy({
    out_dirs: [out_dir],
    to_copy: new GlobScanner().scan(src_dir, '**/*'),
    to_exclude: new GlobScanner().scan(src_dir, ...source_patterns, ...lib_patterns),
  });
  // const tmp_copied_paths = await copy({
  //   out_dirs: [tmp_dir],
  //   to_copy: new GlobScanner().scan(tmp_dir, '**/*'), // exclude nothing
  // });
  const copied_paths = new Set([
    ...src_copied_paths.paths, //
    // ...tmp_copied_paths.paths,
  ]);
  for (const path of copied_paths) {
    onLog(`copy: ${path}`);
  }
  if (build_mode.watch === false) {
    onLog(`${copied_paths.size} files copied.`);
  }
}

// step: archive
export async function buildStep_Archive() {
  await Bun.spawn(['bun', 'vsce', 'package'], { cwd: out_dir.path, stdin: 'inherit', stdout: 'inherit', stderr: 'inherit' }).exited;
  const package_path = [...new GlobScanner().scan(out_dir, '*.vsix').path_groups][0];
  if (package_path) {
    await CopyFile({ from: package_path, to: package_path.newOrigin(pkg_dir) });
  }
}

// logger
export const on_log = new Broadcast<void>();
export function onLog(data: string) {
  if (build_mode.silent === false) {
    ConsoleLogWithDate(data);
    on_log.send();
  }
}

// direct run
if (Bun.argv[1] === __filename) {
  TryLockEach([command_map.build, command_map.format]);

  RunSync.Bun('update');
  Cache_Unlock(command_map.format);
  RunSync.BunRun('format', 'silent');
  TryLock(command_map.format);

  ConsoleNewline();
  if (Cache_FileStats_Lock()) {
    await buildStep_Clean();
    await buildStep_SetupRollup();
    await buildStep_SetupBundler();
    await buildStep_Copy();
  }
  Cache_FileStats_Unlock();
  ConsoleNewline();

  Cache_Unlock(command_map.format);
  RunSync.BunRun('format');
}
