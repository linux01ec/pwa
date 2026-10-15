// app.js - Registro del Service Worker y lógica general de la PWA

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('✅ Service Worker registrado:', reg.scope);
        const estado = document.getElementById('estado');
        if (estado) estado.textContent = '✅ PWA lista (offline disponible)';
      })
      .catch(err => {
        console.error('❌ Error al registrar SW:', err);
        const estado = document.getElementById('estado');
        if (estado) estado.textContent = '⚠️ Service Worker no disponible';
      });
  });
} else {
  window.addEventListener('load', () => {
    const estado = document.getElementById('estado');
    if (estado) estado.textContent = '⚠️ Tu navegador no soporta Service Workers';
  });
}