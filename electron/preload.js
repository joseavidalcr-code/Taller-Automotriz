import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('tallerDesktop', {
  openMechanicPanel: () => ipcRenderer.invoke('open-mechanic-panel')
});

function addMechanicButton() {
  if (window.location.hash === '#mecanico') return;
  const nav = document.querySelector('aside nav');
  if (!nav || nav.querySelector('[data-taller-mechanic-panel]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.tallerMechanicPanel = 'true';
  button.textContent = '🔧 Panel Mecánico';
  button.title = 'Abrir o reabrir el Panel Mecánico';
  button.style.width = '100%';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.gap = '10px';
  button.addEventListener('click', () => window.tallerDesktop.openMechanicPanel());
  nav.appendChild(button);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addMechanicButton);
else addMechanicButton();
new MutationObserver(addMechanicButton).observe(document.documentElement, { childList: true, subtree: true });
