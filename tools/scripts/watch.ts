import { StdinTextReader } from '../../src/lib/ericchase/Platform/Node/Process.js';
import { KEYS } from '../../src/lib/ericchase/Platform/Node/Shell.js';
import { Watcher } from '../../src/lib/ericchase/Platform/Node/Watch.js';
import { ConsoleError } from '../../src/lib/ericchase/Utility/Console.js';
import { Debounce } from '../../src/lib/ericchase/Utility/Debounce.js';
import { command_map } from '../dev.js';
import { TryLockEach } from '../lib/cache/LockCache.js';
import { build_mode, buildStep_Clean, buildStep_Copy, buildStep_SetupBundler, buildStep_SetupRollup, src_dir } from './build.js';

TryLockEach([command_map.build, command_map.format, command_map.watch]);

const stdin = new StdinTextReader();
stdin.addHandler((text) => {
  if (text.startsWith(KEYS.SIGINT)) {
    process.exit();
  }
});
await stdin.start();

build_mode.watch = true;

const build = Debounce(async () => {
  await buildStep_SetupBundler();
  await buildStep_SetupRollup();
  await buildStep_Copy();
}, 100);

try {
  await buildStep_Clean();
  await build();
} catch (error) {
  ConsoleError(error);
}

const watcher_src = new Watcher(src_dir, 100);
watcher_src.observe(async () => {
  try {
    await build();
  } catch (error) {
    ConsoleError(error);
  }
});

await watcher_src.done;
