// app.js - Service Worker + Banner de instalación personalizado

// ============================================================
// 1. Registro del Service Worker
// ============================================================
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


// ============================================================
// 2. Banner de instalación personalizado (estilo YouTube)
// ============================================================

let deferredPrompt = null;

const banner        = document.getElementById('bannerInstalar');
const btnInstalar   = document.getElementById('btnInstalar');
const btnCerrar     = document.getElementById('btnCerrarBanner');

// ¿Ya está instalada? (standalone = abierta como app)
function yaEstaInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}

// ¿El usuario cerró el banner antes? (recordar por 7 días)
function bannerFueCerrado() {
  const cerrado = localStorage.getItem('bannerInstalarCerrado');
  if (!cerrado) return false;
  const hace7dias = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return parseInt(cerrado, 10) > hace7dias;
}

// Capturamos el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();          // Evita el mini-banner nativo
  deferredPrompt = e;          // Guardamos para usarlo al hacer clic
  console.log('💾 beforeinstallprompt capturado');

  // Mostramos nuestro banner si:
  // - No está instalada ya
  // - El usuario no lo cerró recientemente
  if (!yaEstaInstalada() && !bannerFueCerrado()) {
    // Pequeño delay para que no aparezca de golpe al cargar
    setTimeout(() => {
      banner.hidden = false;
    }, 2000);
  }
});

// Al hacer clic en "Instalar"
btnInstalar.addEventListener('click', async () => {
  if (!deferredPrompt) {
    console.warn('⚠️ No hay prompt disponible');
    return;
  }

  // Mostramos el diálogo nativo del navegador
  deferredPrompt.prompt();

  // Esperamos la respuesta del usuario
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`👤 El usuario eligió: ${outcome}`);

  if (outcome === 'accepted') {
    console.log('🎉 Instalación aceptada');
  } else {
    console.log('❌ Instalación rechazada');
  }

  // Limpiamos y ocultamos el banner
  deferredPrompt = null;
  banner.hidden = true;
});

// Al hacer clic en "Ahora no"
btnCerrar.addEventListener('click', () => {
  banner.hidden = true;
  // Guardamos la fecha para no volver a molestar por 7 días
  localStorage.setItem('bannerInstalarCerrado', Date.now().toString());
});

// Cuando la app se instala correctamente
window.addEventListener('appinstalled', () => {
  console.log('🎉 ¡PWA instalada correctamente!');
  banner.hidden = true;
  deferredPrompt = null;
  localStorage.removeItem('bannerInstalarCerrado');
});