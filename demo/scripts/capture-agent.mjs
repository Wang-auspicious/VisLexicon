import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const PORT = 9364;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

async function getJson(path, method = "GET") {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method });
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

const proc = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}/vlx-chrome-test-agent`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--hide-scrollbars",
  "about:blank"
], { stdio: "ignore" });

try {
  for (let i = 0; i < 40; i++) {
    try { await getJson("/json/version"); break; } catch { await new Promise((r) => setTimeout(r, 250)); }
  }
  const created = await getJson("/json/new?about:blank", "PUT");
  const ws = new WebSocket(created.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const e = pending.get(m.id);
      pending.delete(m.id);
      m.error ? e.reject(new Error(m.error.message)) : e.resolve(m.result);
    }
  };
  await new Promise((r) => { ws.onopen = r; });
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, { resolve: res, reject: rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  await send("Page.navigate", { url: "http://localhost:5173/#/atlas/agent-composer" });
  await new Promise((r) => setTimeout(r, 3000));

  const shot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile("demo/agent-composer-preview.png", Buffer.from(shot.data, "base64"));
  console.log("Captured demo/agent-composer-preview.png");

  ws.close();
} finally {
  proc.kill();
}
