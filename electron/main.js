import { app, BrowserWindow, dialog, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 8787;
const mechanicPinPort = 8788;

function writeStartupLog(message, error) {
  try {
    const dir = path.join(app.getPath('userData'), 'logs');
    fs.mkdirSync(dir, { recursive: true });
    const detail = error?.stack || error?.message || String(error || '');
    fs.appendFileSync(path.join(dir, 'startup.log'), `[${new Date().toISOString()}] ${message}${detail ? `\n${detail}` : ''}\n`);
  } catch {}
}

async function startServer() {
  process.env.LOCAL_SERVER_PORT = String(port);
  process.env.MECHANIC_PIN_PORT = String(mechanicPinPort);
  process.env.TALLER_DATA_DIR = path.join(app.getPath('userData'), 'data');
  writeStartupLog('Iniciando servidor local');
  await import('../server/index.js');
  await import('../server/pin-api.js');
  writeStartupLog('Servidores locales iniciados');
}

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) {
        writeStartupLog('Servidor local respondió correctamente');
        return;
      }
    } catch (error) {
      if (i === 39) writeStartupLog('Último intento de conexión al servidor falló', error);
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('El servidor local de Taller Automotriz no respondió en http://127.0.0.1:8787.');
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

app.whenReady().then(createWindow).catch(async error => {
  writeStartupLog('ERROR FATAL DURANTE EL ARRANQUE', error);
  await dialog.showMessageBox({
    type: 'error',
    title: 'Taller Automotriz no pudo iniciarse',
    message: 'No se pudo iniciar el servidor local de Taller Automotriz.',
    detail: `${error?.message || error}\n\nSe ha guardado el diagnóstico en la carpeta de datos de Taller Automotriz.`,
    buttons: ['Aceptar']
  });
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
