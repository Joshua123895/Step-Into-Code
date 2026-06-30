import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

function findPython() {
  for (const cmd of ['python', 'python3']) {
    try {
      exec(`${cmd} --version`, { timeout: 2000 });
      return cmd;
    } catch { /* skip */ }
  }
  return null;
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'python-runner',
      configureServer(server) {
        const pythonCmd = findPython();

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
                res.end(JSON.stringify({ error: 'Python not found. Install Python or use the built-in runner.' }));
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
                      mkdtempSync(dir);
                    }
                    writeFileSync(join(tmpDir, name), content, 'utf-8');
                  }
                }

                const scriptPath = join(tmpDir, 'main.py');
                writeFileSync(scriptPath, code, 'utf-8');

                await new Promise((resolve, reject) => {
                  const child = exec(
                    `${pythonCmd} main.py`,
                    { cwd: tmpDir, timeout: 10000, maxBuffer: 1024 * 1024 },
                    (err, out, errOut) => {
                      stdout = out || '';
                      stderr = errOut || '';
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
