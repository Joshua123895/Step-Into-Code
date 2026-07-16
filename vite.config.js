import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { exec, spawn } from 'child_process'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'

const WRAPPER_LINES = 15;

function cleanTraceback(text, tmpDir) {
  const escaped = tmpDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let result = text.replace(new RegExp(escaped + '[\\\\/]', 'g'), '');
  result = result.replace(/line \d+/g, (m) => {
    const n = parseInt(m.slice(5), 10) - WRAPPER_LINES;
    return 'line ' + (n >= 1 ? n : 1);
  });
  return result;
}

function findPython() {
  for (const cmd of ['python', 'python3']) {
    try {
      exec(`${cmd} --version`, { timeout: 2000 });
      return cmd;
    } catch { /* skip */ }
  }
  return null;
}

const runningProcesses = new Map();

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    {
      name: 'python-runner',
      configureServer(server) {
        const pythonCmd = findPython();

        server.middlewares.use('/api/run-python-stream', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const { code, initialFiles, trackedFiles, inputs } = JSON.parse(body);

              if (!pythonCmd) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Python not found.' }));
                return;
              }

              const streamId = randomBytes(8).toString('hex');
              const tmpDir = mkdtempSync(join(tmpdir(), 'step-into-code-'));

              if (initialFiles) {
                for (const [name, content] of Object.entries(initialFiles)) {
                  const dir = join(tmpDir, name.split('/').slice(0, -1).join('/'));
                  if (dir !== tmpDir) {
                    try { mkdtempSync(dir); } catch { /* exists */ }
                  }
                  writeFileSync(join(tmpDir, name), content, 'utf-8');
                }
              }

const inputWrapper = `
import sys, builtins
_orig_input = builtins.input
def _input(prompt=""):
    if prompt:
        sys.stdout.write(prompt)
        sys.stdout.flush()
    sys.stderr.write("__INPUT_REQ__\\n")
    sys.stderr.flush()
    line = _orig_input()
    sys.stdout.write(line + "\\n")
    sys.stdout.flush()
    return line
builtins.input = _input
`;

              writeFileSync(join(tmpDir, 'main.py'), inputWrapper + '\n' + code, 'utf-8');

              const child = spawn(pythonCmd, ['main.py'], {
                cwd: tmpDir,
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: 15000,
              });

              const sseClients = new Set();
              let stdoutBuf = '';
              let stderrBuf = '';

              runningProcesses.set(streamId, {
                child,
                tmpDir,
                sseClients,
                trackedFiles: trackedFiles || [],
              });

              child.stdout.on('data', (data) => {
                const text = data.toString();
                stdoutBuf += text;
                for (const client of sseClients) {
                  client.write(`event: output\ndata: ${JSON.stringify(text)}\n\n`);
                }
              });

              child.stderr.on('data', (data) => {
                const text = cleanTraceback(data.toString(), tmpDir);
                if (text.includes('__INPUT_REQ__')) {
                  for (const client of sseClients) {
                    client.write(`event: input-request\ndata: ${JSON.stringify({ prompt: '' })}\n\n`);
                  }
                } else {
                  stderrBuf += text;
                  for (const client of sseClients) {
                    client.write(`event: output\ndata: ${JSON.stringify(text)}\n\n`);
                  }
                }
              });

              child.on('close', (exitCode) => {
                const files = {};
                for (const name of (runningProcesses.get(streamId)?.trackedFiles || [])) {
                  try {
                    const filePath = join(tmpDir, name);
                    if (existsSync(filePath)) {
                      files[name] = readFileSync(filePath, 'utf-8');
                    }
                  } catch { /* skip */ }
                }

                for (const client of sseClients) {
                  client.write(`event: done\ndata: ${JSON.stringify({ exitCode, files, stdout: stdoutBuf, error: stderrBuf })}\n\n`);
                  client.end();
                }

                runningProcesses.delete(streamId);
                try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* cleanup */ }
              });

              child.on('error', (err) => {
                for (const client of sseClients) {
                  client.write(`event: done\ndata: ${JSON.stringify({ exitCode: 1, files: {}, stdout: '', error: err.message })}\n\n`);
                  client.end();
                }
                runningProcesses.delete(streamId);
                try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* cleanup */ }
              });

              if (inputs && inputs.length > 0) {
                child.stdin.write(inputs.join('\n'));
                child.stdin.end();
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ streamId }));
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        });

        server.middlewares.use('/api/run-python-events', (req, res) => {
          const urlParts = req.url.split('/');
          const streamId = urlParts[urlParts.length - 1];

          const proc = runningProcesses.get(streamId);
          if (!proc) {
            res.statusCode = 404;
            res.end('Stream not found');
            return;
          }

          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.flushHeaders();

          res.write('event: connected\ndata: {}\n\n');
          proc.sseClients.add(res);

          req.on('close', () => {
            proc.sseClients.delete(res);
          });
        });

        server.middlewares.use('/api/run-python-input', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          const urlParts = req.url.split('/');
          const streamId = urlParts[urlParts.length - 1];

          const proc = runningProcesses.get(streamId);
          if (!proc) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Stream not found' }));
            return;
          }

          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { input } = JSON.parse(body);
              proc.child.stdin.write(input + '\n');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        });

        server.middlewares.use('/api/run-python', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const { code, initialFiles, trackedFiles, inputs } = JSON.parse(body);

              if (!pythonCmd) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Python not found.' }));
                return;
              }

              const tmpDir = mkdtempSync(join(tmpdir(), 'step-into-code-'));
              let stdout = '';
              let stderr = '';

              try {
                if (initialFiles) {
                  for (const [name, content] of Object.entries(initialFiles)) {
                    const dir = join(tmpDir, name.split('/').slice(0, -1).join('/'));
                    if (dir !== tmpDir) {
                      try { mkdtempSync(dir); } catch { /* exists */ }
                    }
                    writeFileSync(join(tmpDir, name), content, 'utf-8');
                  }
                }

                writeFileSync(join(tmpDir, 'main.py'), inputWrapper + '\n' + code, 'utf-8');

                await new Promise((resolve, reject) => {
                  const child = exec(
                    `${pythonCmd} main.py`,
                    { cwd: tmpDir, timeout: 10000, maxBuffer: 1024 * 1024 },
                    (err, out, errOut) => {
                      stdout = out || '';
                      stderr = cleanTraceback(errOut || '', tmpDir);
                      if (err && !err.killed) {
                        if (stderr) stdout += '\n' + stderr;
                        reject(err);
                      } else {
                        resolve();
                      }
                    }
                  );

                  if (inputs && inputs.length > 0) {
                    child.stdin.write(inputs.join('\n'));
                    child.stdin.end();
                  }
                });

                const files = {};
                if (trackedFiles) {
                  for (const name of trackedFiles) {
                    const filePath = join(tmpDir, name);
                    if (existsSync(filePath)) {
                      files[name] = readFileSync(filePath, 'utf-8');
                    }
                  }
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ stdout, files }));
              } catch (e) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ stdout: stdout || '', files: {}, error: stderr || e.message }));
              } finally {
                try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* cleanup */ }
              }
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        });
      },
    },
  ],
})
