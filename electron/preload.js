import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('tallerDesktop', {
  openMechanicPanel: () => ipcRenderer.invoke('open-mechanic-panel')
});
