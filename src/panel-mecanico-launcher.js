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
        window.open(`${window.location.href.split('#')[0]}#mecanico`, '_blank');
      }
    } catch (error) {
      console.error('No se pudo abrir el Panel Mecánico', error);
    }
  });
  nav.appendChild(button);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installMechanicPanelButton);
else installMechanicPanelButton();
new MutationObserver(installMechanicPanelButton).observe(document.documentElement, { childList: true, subtree: true });
