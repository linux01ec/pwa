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
let timeoutBanner = null;   // ← para poder cancelar el setTimeout
let bannerCerrado = false;  // ← bandera en memoria para bloquear reapertura

const banner = document.getElementById('bannerInstalar');
const btnInstalar = document.getElementById('btnInstalar');
const btnCerrar = document.getElementById('btnCerrarBanner');

// ¿Ya está instalada? (standalone = abierta como app)
function yaEstaInstalada() {
  // Si guardamos la marca en localStorage al instalar
  if (localStorage.getItem('appInstalada') === 'true') return true;

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

// Función central para mostrar el banner (con todas las validaciones)
function mostrarBanner() {
  // 🔒 Doble chequeo por si algo cambió mientras esperábamos
  if (bannerCerrado || yaEstaInstalada() || bannerFueCerrado()) {
    console.log('⏭️ Banner bloqueado (cerrado, instalado o en espera)');
    return;
  }
  banner.hidden = false;
}

// Función central para ocultar el banner
function ocultarBanner() {
  banner.hidden = true;
  // Cancelamos cualquier timeout pendiente que lo pudiera volver a mostrar
  if (timeoutBanner) {
    clearTimeout(timeoutBanner);
    timeoutBanner = null;
  }
}


// ============================================================
// 3. Detección inicial: si ya está instalada, no hacer nada
// ============================================================
if (yaEstaInstalada()) {
  console.log('ℹ️ La app ya está instalada. Banner desactivado.');
  ocultarBanner();
}


// ============================================================
// 4. Capturamos el evento beforeinstallprompt
// ============================================================
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('💾 beforeinstallprompt capturado');

  // Si ya está instalada o el usuario lo cerró hace poco, salimos
  if (yaEstaInstalada() || bannerFueCerrado()) {
    console.log('⏭️ No se muestra banner (ya instalada o cerrado recientemente)');
    return;
  }

  // Guardamos la referencia del timeout para poder cancelarlo
  timeoutBanner = setTimeout(() => {
    timeoutBanner = null;
    mostrarBanner();
  }, 2000);
});


// ============================================================
// 5. Click en "Instalar"
// ============================================================
btnInstalar.addEventListener('click', async () => {
  if (!deferredPrompt) {
    console.warn('⚠️ No hay prompt disponible');
    // Si no hay prompt, al menos ocultamos el banner
    ocultarBanner();
    return;
  }

  // Ocultamos el banner INMEDIATAMENTE (antes de que el usuario decida)
  ocultarBanner();
  bannerCerrado = true;  // 🔒 Bloqueado hasta que recargue la página

  // Mostramos el diálogo nativo del navegador
  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;
  console.log(`👤 El usuario eligió: ${outcome}`);

  if (outcome === 'accepted') {
    console.log('🎉 Instalación aceptada');
    // Guardamos para que en futuras visitas no aparezca nunca más
    localStorage.setItem('appInstalada', 'true');
  }

  // Limpiamos el evento (solo se puede usar una vez)
  deferredPrompt = null;
});


// ============================================================
// 6. Click en "Ahora no"
// ============================================================
btnCerrar.addEventListener('click', () => {
  console.log('👋 Usuario cerró el banner');
  bannerCerrado = true; // 🔒 Bloqueado hasta que recargue
  ocultarBanner();
  // Guardamos la fecha para no volver a molestar por 7 días
  localStorage.setItem('bannerInstalarCerrado', Date.now().toString());
});


// ============================================================
// 7. Cuando la app se instala correctamente
// ============================================================
window.addEventListener('appinstalled', () => {
  console.log('🎉 ¡PWA instalada correctamente!');
  bannerCerrado = true;
  ocultarBanner();
  deferredPrompt = null;
  localStorage.setItem('appInstalada', 'true');
  localStorage.removeItem('bannerInstalarCerrado');
});


// ============================================================
// 8. Extra: detectar cambio a modo standalone en vivo
// ============================================================
// Si el usuario instala la PWA mientras tiene la web abierta,
// este listener detecta el cambio y oculta el banner al instante.
window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
  if (e.matches) {
    console.log('📱 Cambio a modo standalone detectado');
    bannerCerrado = true;
    ocultarBanner();
  }
});