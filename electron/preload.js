import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('tallerDesktop', {
  openMechanicPanel: () => ipcRenderer.invoke('open-mechanic-panel'),
  listMechanics: () => ipcRenderer.invoke('list-mechanics'),
  loginMechanic: (id, pin) => ipcRenderer.invoke('login-mechanic', { id, pin }),
  setMechanicPin: (id, pin, adminPassword) => ipcRenderer.invoke('set-mechanic-pin', { id, pin, adminPassword }),
  setMechanicEnabled: (id, enabled, adminPassword) => ipcRenderer.invoke('set-mechanic-enabled', { id, enabled, adminPassword })
});
