import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

const children = [
  spawn(process.execPath, ['server.js'], { cwd: rootDir, stdio: 'inherit' }),
  spawn(process.execPath, [viteBin, '--configLoader', 'native'], { cwd: rootDir, stdio: 'inherit' }),
];

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  process.exit(exitCode);
}

for (const child of children) {
  child.on('exit', (code) => {
    if (!shuttingDown) {
      shutdown(code ?? 0);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
