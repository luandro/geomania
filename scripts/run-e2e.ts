import { spawn } from 'node:child_process';
import net from 'node:net';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

// Handle stdin EIO errors gracefully (happens when terminal closes during non-interactive mode)
process.stdin.on('error', (err) => {
  if (err.code === 'EIO') {
    // Terminal closed, ignore and exit cleanly
    process.exit(0);
  }
});

const getBin = (name: string) => (process.platform === 'win32' ? `${name}.cmd` : name);

const run = (command: string, args: string[], env?: NodeJS.ProcessEnv) =>
  spawn(command, args, {
    stdio: ['ignore', 'inherit', 'inherit'], // Don't inherit stdin to prevent EIO errors
    env,
    shell: false
  });

const getAvailablePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to acquire a free port.'));
        return;
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
  });

const waitForServer = async (url: string, timeoutMs = 60000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) return;
    } catch {
      // Server not ready yet.
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for preview server at ${url}`);
};

const main = async () => {
  const args = process.argv.slice(2);
  const port = await getAvailablePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const buildEnv = {
    ...process.env,
    VITE_DISABLE_PWA: 'true',
  };
  const build = run(getBin('npm'), ['run', 'build'], buildEnv);
  const buildExit = await new Promise<number>((resolve) => {
    build.on('exit', (code) => resolve(code ?? 1));
  });
  if (buildExit !== 0) {
    process.exit(buildExit);
  }

  const previewEnv = { ...process.env };
  const preview = run(getBin('npm'), [
    'run',
    'preview',
    '--',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
  ], previewEnv);

  let previewExited = false;
  preview.on('exit', () => {
    previewExited = true;
  });

  try {
    await waitForServer(baseUrl);
  } catch (error) {
    if (!previewExited) {
      preview.kill('SIGTERM');
    }
    throw error;
  }

  const testEnv = {
    ...process.env,
    PW_EXTERNAL_SERVER: '1',
    PW_PORT: String(port),
    PLAYWRIGHT_BASE_URL: baseUrl,
  };

  const playwright = run(getBin('npx'), ['playwright', 'test', ...args], testEnv);
  const exitCode = await new Promise<number>((resolve) => {
    playwright.on('exit', (code) => resolve(code ?? 1));
  });

  if (!previewExited) {
    preview.kill('SIGTERM');
  }

  process.exit(exitCode);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
