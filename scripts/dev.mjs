// Preserve Next.js while accepting the supervised preview's generic CLI flags.
import { spawn } from 'node:child_process';
const received = process.argv.slice(2);
const args = [];
for (let i = 0; i < received.length; i++) {
  if (received[i] === '--strictPort') continue;
  args.push(received[i] === '--host' ? '--hostname' : received[i]);
}
if (!args.includes('--port')) args.push('--port', '4173');
const child = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'dev', '--webpack', ...args],
  { stdio: 'inherit' },
);
child.on('exit', (code) => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => child.kill(signal));
