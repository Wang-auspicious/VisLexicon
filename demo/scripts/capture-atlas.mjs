import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const PORT = 9361;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

async function getJson(path, method = "GET") {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method });
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

const proc = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}/vlx-chrome-atlas-check`,
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

  await send("Page.navigate", { url: "http://127.0.0.1:5173/#/atlas" });
  await new Promise((r) => setTimeout(r, 4000));

  const screenshot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile("atlas-preview.png", Buffer.from(screenshot.data, "base64"));
  console.log("Screenshot saved to atlas-preview.png!");

  const evalv = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
  const domState = await evalv(`({
    hasWindow: !!document.querySelector(".ax-mac-window"),
    title: document.querySelector(".ax-title-main")?.textContent,
    chipsCount: document.querySelectorAll(".ax-vchip").length,
    activeChip: document.querySelector(".ax-vchip.on")?.textContent,
    specimenText: document.querySelector(".tr-line")?.textContent,
    drawersClosed: {
      railClosed: document.querySelector(".ax-rail")?.classList.contains("closed"),
      panelClosed: document.querySelector(".ax-panel")?.classList.contains("closed")
    }
  })`);
  console.log("DOM State:", JSON.stringify(domState, null, 2));

  ws.close();
} finally {
  proc.kill();
}
