function installMechanicPanelButton() {
  if (window.location.hash === '#mecanico') return;
  const nav = document.querySelector('aside nav');
  if (!nav || nav.querySelector('[data-mechanic-panel]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.mechanicPanel = 'true';
  button.textContent = '🔧 Panel Mecánico';
  button.title = 'Abrir o reabrir el Panel Mecánico';
  button.addEventListener('click', async () => {
    try {
      if (window.tallerDesktop?.openMechanicPanel) {
        await window.tallerDesktop.openMechanicPanel();
      } else {
        const url = `${window.location.href.split('#')[0]}#mecanico`;
        const win = window.open(url, '_blank', 'width=1050,height=800,resizable=yes');
        if (!win) console.error('Electron bloqueó la apertura del Panel Mecánico');
      }
    } catch (error) {
      console.error('No se pudo abrir el Panel Mecánico', error);
      const url = `${window.location.href.split('#')[0]}#mecanico`;
      window.open(url, '_blank', 'width=1050,height=800,resizable=yes');
    }
  });
  nav.appendChild(button);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installMechanicPanelButton);
else installMechanicPanelButton();
new MutationObserver(installMechanicPanelButton).observe(document.documentElement, { childList: true, subtree: true });
