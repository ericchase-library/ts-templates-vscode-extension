import { RunSync } from 'src/lib/ericchase/Platform/Bun/Child Process.js';
import { BuildStep, DefaultBuilder } from 'tools/lib/Builder.js';
import { Cache_Unlock, TryLock } from 'tools/lib/cache/LockCache.js';

export class Step_Format implements BuildStep {
  builder = DefaultBuilder;

  async run() {
    Cache_Unlock('Format');
    RunSync.BunRun('format', 'silent');
    TryLock('Format');
  }
}
