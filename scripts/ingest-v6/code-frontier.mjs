// GitHub uses the authenticated gh CLI; public npm/codeload use ordinary HTTP.
// The Python standard library reads archives without extracting paths or executing code.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const child = spawn(process.env.VISLEXICON_PYTHON || 'python', [
  fileURLToPath(new URL('./code-frontier.py', import.meta.url)), ...process.argv.slice(2),
], { stdio: 'inherit', windowsHide: true });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
