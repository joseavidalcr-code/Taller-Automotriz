import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 8787;

async function startServer() {
  process.env.LOCAL_SERVER_PORT = String(port);
  process.env.TALLER_DATA_DIR = path.join(app.getPath('userData'), 'data');
  await import('../server/index.js');
}

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('El servidor local de Taller Automotriz no respondió.');
}

async function createWindow() {
  await startServer();
  await waitForServer();

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Taller Automotriz'
  });

  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('file:')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow).catch(error => {
  console.error(error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
