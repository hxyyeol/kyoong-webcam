/* ============================================================
   KYOONG WEB CAM — js/app.js
   ============================================================
   ÍNDICE:
   1. Estado de la app
   2. Navegación (inicio → juego)
   3. Panel de frame revelado
   4. Overlays de frame en el strip
   5. Cámara
   6. Tomar foto
   7. Construir strip final
   8. Descargar / Reset
   9. Gacha
   10. Texto de carga animado
   ============================================================ */


/* ============================================================
   1. ESTADO DE LA APP
   ============================================================ */
let curFrame    = -1;    // índice del frame activo (-1 = sin frame)
let hasRolled   = false; // true cuando el usuario hizo al menos un roll
let camActive   = false; // true cuando la cámara está encendida
let looping     = false; // true cuando el render loop está corriendo
let shotsTaken  = 0;     // número de fotos tomadas (0–4)

const MAX_SHOTS    = 4;  // ← cambia aquí si quieres más o menos fotos

// Almacena los canvas HD de cada foto capturada
// (600×600px cada uno, se usan para construir el strip final)
const slotPhotosHD = [null, null, null, null];


/* ============================================================
   3. NAVEGACIÓN
   ============================================================ */

/**
 * Transición de la pantalla de inicio a la pantalla de juego.
 */
function goToGame() {
  document.getElementById('startScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');
  refreshFrameOverlays();
}


/* ============================================================
   4. PANEL DE FRAME REVELADO
   ============================================================ */

/**
 * Actualiza el panel lateral izquierdo (TU FRAME)
 * para mostrar el frame recién obtenido del gacha.
 * @param {number} idx - índice del frame en FRAMES[]
 */
function updateFramePanel(idx) {
  const f      = FRAMES[idx];
  const box    = document.getElementById('framThumbBox');
  const li     = document.getElementById('lockInner');
  const status = document.getElementById('fiStatus');
  const name   = document.getElementById('fiName');
  const rar    = document.getElementById('fiRarity');
  const hint   = document.getElementById('rollBlink');

  const rcClass = { cute:'rb-cute', lovely:'rb-lovely', secret:'rb-secret' }[f.rarity];
  const rcEmoji = { cute:'🌸',      lovely:'💚',         secret:'⭐'        }[f.rarity];

  // Desbloquear la caja y dibujar el frame en miniatura (ratio 1:3)
  box.classList.remove('locked');
  li.style.display = 'none';
  const old = box.querySelector('canvas');
  if (old) old.remove();

  const cv      = document.createElement('canvas');
  cv.width      = 60;
  cv.height     = 180;
  cv.className  = 'frame-in';
  box.appendChild(cv);
  const ctx = cv.getContext('2d');
  f.draw(ctx, 60, 180);

  // Actualizar textos
  status.textContent      = '✦ FRAME OBTENIDO';
  name.textContent        = f.name;
  name.classList.remove('empty');
  rar.className           = `rarity-bubble ${rcClass}`;
  rar.textContent         = `${rcEmoji} ${f.label}`;
  hint.style.display      = 'none';
}


/* ============================================================
   5. OVERLAYS DE FRAME EN EL STRIP
   ============================================================
   Dibuja la porción del frame correspondiente a cada slot
   sobre los canvas de overlay.
   ============================================================ */

/** Refresca todos los overlays del strip con el frame actual */
function refreshFrameOverlays() {
  const strip = document.getElementById('stripLive');
  if (!strip) return;

  const sw = strip.offsetWidth;
  const sh = strip.offsetHeight;
  if (!sw || !sh) return;

  // Slot 0: overlay en tiempo real (sobre el video o la foto)
  const oc0   = document.getElementById('slotCanvasF0');
  oc0.width   = sw;
  oc0.height  = Math.round(sh / 4);
  const ctx0  = oc0.getContext('2d');
  ctx0.clearRect(0, 0, oc0.width, oc0.height);
  if (curFrame >= 0) drawSlotFrame(ctx0, sw, sh, 0);

  // Slots 1–3: overlays estáticos
  [1, 2, 3].forEach(i => {
    const fc   = document.getElementById('slotCanvasF' + i);
    fc.width   = sw;
    fc.height  = Math.round(sh / 4);
    const fctx = fc.getContext('2d');
    fctx.clearRect(0, 0, fc.width, fc.height);
    if (curFrame >= 0) drawSlotFrame(fctx, sw, sh, i);
  });
}

/**
 * Dibuja la porción del frame que corresponde a un slot específico.
 * Genera el frame completo en un canvas offscreen y luego
 * copia únicamente la franja del slot indicado.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} sw       - ancho del strip
 * @param {number} sh       - alto total del strip
 * @param {number} slotIdx  - índice del slot (0–3)
 */
function drawSlotFrame(ctx, sw, sh, slotIdx) {
  if (curFrame < 0) return;

  const oc    = document.createElement('canvas');
  oc.width    = sw;
  oc.height   = sh;
  const octx  = oc.getContext('2d');
  FRAMES[curFrame].draw(octx, sw, sh);

  const slotH = Math.round(sh / 4);
  const sy    = slotIdx * slotH;
  ctx.drawImage(oc, 0, sy, sw, slotH, 0, 0, sw, slotH);
}


/* ============================================================
   6. CÁMARA
   ============================================================ */

/** Solicita permiso y enciende la cámara frontal en alta resolución */
async function startCam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width:  { ideal: 1280 },  // pide alta resolución
        height: { ideal: 1280 },  // el navegador dará lo que pueda
      }
    });
    const v     = document.getElementById('videoEl');
    v.srcObject = stream;
    camActive   = true;

    document.getElementById('noCamStrip').style.display = 'none';
    updateSnapBtn();
  updateDeleteBtn();
    if (!looping) liveLoop();

  } catch (e) {
    alert('No se pudo acceder a la cámara 📷\nVerifica los permisos en tu navegador.');
  }
}

/** Loop de render — actualiza los overlays en cada frame de video */
function liveLoop() {
  looping     = true;
  const tick  = () => {
    if (!camActive) { looping = false; return; }
    refreshFrameOverlays();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Actualiza el estado del botón de foto.
 * Se activa solo cuando hay cámara + frame + slots disponibles.
 */
function updateSnapBtn() {
  const ready = camActive && hasRolled && shotsTaken < MAX_SHOTS;
  document.getElementById('snapBtn').disabled = !ready;
}

function updateDeleteBtn() {
  const btn = document.getElementById('deleteBtn');
  if (btn) btn.disabled = shotsTaken === 0;
}

/**
 * Elimina la última foto tomada y devuelve la cámara a ese slot.
 */
function deleteSnap() {
  if (shotsTaken === 0) return;

  shotsTaken--;
  const idx = shotsTaken;

  // Limpiar foto HD
  slotPhotosHD[idx] = null;

  // Limpiar canvas de foto
  const sc = document.getElementById('slotCanvas' + idx);
  if (sc) {
    const ctx = sc.getContext('2d');
    ctx.clearRect(0, 0, sc.width, sc.height);
    if (idx === 0) sc.style.display = 'none';
  }

  // Limpiar canvas de frame overlay
  const fsc = document.getElementById('slotCanvasF' + idx);
  if (fsc) {
    const fctx = fsc.getContext('2d');
    fctx.clearRect(0, 0, fsc.width, fsc.height);
  }

  // Quitar clases del slot siguiente (ya no es activo)
  const nextSlot = document.getElementById('slot' + (idx + 1));
  if (nextSlot) nextSlot.classList.remove('active-slot');

  // Restaurar slot eliminado como activo
  const delSlot = document.getElementById('slot' + idx);
  delSlot.classList.remove('taken');
  delSlot.classList.add('active-slot');

  // Devolver video a ese slot
  const v = document.getElementById('videoEl');
  v.style.display = 'block';
  delSlot.insertBefore(v, delSlot.firstChild);

  // Ocultar resultado si estaba visible
  document.getElementById('resultSection').classList.remove('show');

  document.getElementById('shotCounter').textContent = `${shotsTaken} / ${MAX_SHOTS}`;
  updateSnapBtn();
  updateDeleteBtn();
  updateDeleteBtn();
}


/* ============================================================
   7. TOMAR FOTO
   ============================================================ */

/**
 * Captura el slot activo a ALTA RESOLUCIÓN:
 *   - Usa las dimensiones nativas del video (ej. 1280×720)
 *   - Guarda en slotPhotosHD[] para el strip final
 *   - El canvas de previsualización sigue siendo pequeño (pantalla)
 */
function takeSnap() {
  if (!camActive || !hasRolled || shotsTaken >= MAX_SHOTS) return;

  const idx   = shotsTaken;
  const slot  = document.getElementById('slot' + idx);
  const v     = document.getElementById('videoEl');

  // ── Resolución nativa del video (alta calidad) ──
  const VW    = v.videoWidth  || 640;
  const VH    = v.videoHeight || 480;

  // Recortar el video respetando la proporción exacta del slot (600:450 = 4:3)
  // para que la foto no se estire al pegarla en el strip
  const targetRatio = SLOT_HD_W / SLOT_HD_H;
  let cropW, cropH, sx, sy;

  if (VW / VH > targetRatio) {
    // Video más ancho que el slot → recortar los lados
    cropH = VH;
    cropW = Math.round(VH * targetRatio);
    sx    = Math.round((VW - cropW) / 2);
    sy    = 0;
  } else {
    // Video más alto que el slot → recortar arriba y abajo
    cropW = VW;
    cropH = Math.round(VW / targetRatio);
    sx    = 0;
    sy    = Math.round((VH - cropH) / 2);
  }

  // Canvas HD con proporción correcta del slot
  const hdCanvas   = document.createElement('canvas');
  hdCanvas.width   = SLOT_HD_W;
  hdCanvas.height  = SLOT_HD_H;
  const hdCtx      = hdCanvas.getContext('2d');

  // Dibujar video espejado recortado a la proporción del slot
  hdCtx.save();
  hdCtx.scale(-1, 1);
  hdCtx.drawImage(v, sx, sy, cropW, cropH, -SLOT_HD_W, 0, SLOT_HD_W, SLOT_HD_H);
  hdCtx.restore();

  // Guardar en memoria
  slotPhotosHD[idx] = hdCanvas;

  // Flash
  const fl         = document.getElementById('flash');
  fl.style.opacity = '1';
  setTimeout(() => { fl.style.opacity = '0'; }, 130);

  // ── Preview en pantalla (canvas pequeño, solo visual) ──
  const strip = document.getElementById('stripLive');
  const sw    = strip.offsetWidth;
  const sh    = strip.offsetHeight;
  const slotH = Math.round(sh / 4);

  const sc    = document.getElementById('slotCanvas' + idx);
  sc.width    = sw;
  sc.height   = slotH;
  const ctx   = sc.getContext('2d');

  // Escalar el HD canvas al tamaño de pantalla para el preview
  ctx.drawImage(hdCanvas, 0, 0, sw, slotH);

  // Mostrar el canvas de foto de slot0 y ocultar el video
  if (idx === 0) {
    sc.style.display = 'block';
    v.style.display  = 'none';
  }

  // Frame encima en el canvas de overlay separado
  const fc  = document.getElementById('slotCanvasF' + idx);
  if (fc) {
    fc.width  = sw;
    fc.height = slotH;
    const fctx = fc.getContext('2d');
    fctx.clearRect(0, 0, sw, slotH);
    drawSlotFrame(fctx, sw, sh, idx);
  }

  // Marcar slot
  slot.classList.remove('active-slot');
  slot.classList.add('taken');

  shotsTaken++;
  document.getElementById('shotCounter').textContent = `${shotsTaken} / ${MAX_SHOTS}`;

  if (shotsTaken < MAX_SHOTS) {
    const nextSlot = document.getElementById('slot' + shotsTaken);
    nextSlot.classList.add('active-slot');
    v.style.display = 'block';
    nextSlot.insertBefore(v, nextSlot.firstChild);
    updateSnapBtn();
  updateDeleteBtn();
  } else {
    updateSnapBtn();
  updateDeleteBtn();
    buildFinalStrip();
  }
}


/* ============================================================
   8. CONSTRUIR STRIP FINAL — ALTA RESOLUCIÓN
   ============================================================
   Resolución de salida: 600 × 1800 px
   = 2 × 6 pulgadas a 300 DPI (calidad de impresión)

   Cada slot ocupa 600 × 450 px (600 ancho, 1800/4 alto)
   ============================================================ */

/** Ancho del strip final en px */
const STRIP_W = 600;
/** Alto del strip final en px (ratio 1:3) */
const STRIP_H = 1800;
/** Dimensiones de cada slot HD — misma proporción que el slot en el strip */
const SLOT_HD_W = STRIP_W;                          // 600px
const SLOT_HD_H = Math.round(STRIP_H / MAX_SHOTS);  // 450px (600×1800 / 4)

/**
 * Construye el strip final en alta resolución usando
 * las fotos HD guardadas en slotPhotosHD[].
 */
function buildFinalStrip() {
  const fc  = document.getElementById('finalCanvas');
  fc.width  = STRIP_W;
  fc.height = STRIP_H;
  const ctx = fc.getContext('2d');

  // Fondo negro
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  const slotH = SLOT_HD_H; // 450px por slot

  // Pegar cada foto HD en su slot correspondiente
  [0, 1, 2, 3].forEach(i => {
    const photo = slotPhotosHD[i];
    if (photo) {
      // Escalar la foto cuadrada HD al slot rectangular del strip
      ctx.drawImage(photo, 0, i * slotH, STRIP_W, slotH);
    }
  });

  // Frame encima a resolución full (600×1800)
  if (curFrame >= 0) {
    FRAMES[curFrame].draw(ctx, STRIP_W, STRIP_H);
  }

  // Mostrar sección de resultado
  const rs = document.getElementById('resultSection');
  rs.classList.add('show');
  rs.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


/* ============================================================
   9. DESCARGAR / RESET
   ============================================================ */

/** Descarga el strip final como PNG */
function dlStrip() {
  const fc   = document.getElementById('finalCanvas');
  const a    = document.createElement('a');
  a.download = `kyoong-strip-${Date.now()}.png`;
  a.href     = fc.toDataURL('image/png');
  a.click();
}

/**
 * Reinicia la sesión de fotos:
 *   - Limpia los 4 slots
 *   - Devuelve el video al slot 0
 *   - Oculta la sección de resultado
 *   - Mantiene el frame actual seleccionado
 */
function resetStrip() {
  shotsTaken = 0;
  document.getElementById('shotCounter').textContent = '0 / 4';
  document.getElementById('resultSection').classList.remove('show');

  // Limpiar fotos HD guardadas
  slotPhotosHD.fill(null);

  [0, 1, 2, 3].forEach(i => {
    const slot = document.getElementById('slot' + i);
    slot.classList.remove('active-slot', 'taken');
    if (i === 0) slot.classList.add('active-slot');

    // Limpiar canvas de foto
    const sc = document.getElementById('slotCanvas' + i);
    if (sc) {
      const ctx = sc.getContext('2d');
      if (sc.width) ctx.clearRect(0, 0, sc.width, sc.height);
      if (i === 0) sc.style.display = 'none'; // ocultar foto canvas de slot0, se mostrará el video
    }

    // Limpiar canvas de frame overlay
    const fsc = document.getElementById('slotCanvasF' + i);
    if (fsc) {
      const fctx = fsc.getContext('2d');
      if (fsc.width) fctx.clearRect(0, 0, fsc.width, fsc.height);
    }
  });

  const v    = document.getElementById('videoEl');
  v.style.display = 'block';
  document.getElementById('slot0').insertBefore(v, document.getElementById('slot0').firstChild);

  updateSnapBtn();
  updateDeleteBtn();
}


/* ============================================================
   10. GACHA
   ============================================================ */

/**
 * Ejecuta el roll del gacha.
 * Probabilidades definidas en cada frame (pct):
 *   Frame 0 (cute)   → 45%
 *   Frame 1 (lovely) → 40%
 *   Frame 2 (secret) → 15%
 *
 * Para cambiar probabilidades, edita los valores `pct` en frames.js
 * y ajusta los umbrales aquí.
 */
function doGacha() {
  const r = Math.random() * 100;
  // r < 45 → cute | r < 85 → lovely | resto → secret
  showOverlay(r < 45 ? 0 : r < 85 ? 1 : 2);
}

/**
 * Muestra el overlay de revelación de carta gacha.
 * @param {number} idx - índice del frame ganado
 */
function showOverlay(idx) {
  const f   = FRAMES[idx];
  const ol  = document.getElementById('gachaOverlay');
  const gpl = document.getElementById('gpLayer');
  const gco = document.getElementById('gCardOuter');

  /* ── Partículas ── */
  gpl.innerHTML = '';
  const emojis  = idx === 2
    ? ['💛', '❤️', '✦', '✿', '✨']
    : idx === 1
      ? ['💚', '⭐', '✦', '🌿', '✧']
      : ['🌸', '⭐', '💛', '🌼', '✦'];

  for (let i = 0; i < 26; i++) {
    const p      = document.createElement('div');
    p.className  = 'gp';
    const ty     = (Math.random() > .5 ? -1 : 1) * (80 + Math.random() * 200);
    p.style.cssText = `
      --sz:  ${16 + Math.random() * 18}px;
      --dur: ${.7 + Math.random() * 1.3}s;
      --del: ${Math.random() * .5}s;
      --lft: ${Math.random() * 100}%;
      --ty:  ${ty}px;
    `;
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    gpl.appendChild(p);
  }

  /* ── Carta ── */
  const pid = 'gp' + Date.now();
  gco.innerHTML = `
    <div class="g-card gc-${f.rarity}">
      <div class="card-shine"></div>
      <div class="card-rarity">${f.label}</div>
      <div class="card-emoji">${f.emoji}</div>
      <div class="card-preview">
        <canvas id="${pid}" width="60" height="180"></canvas>
      </div>
      <div class="card-name cn-${f.rarity}">${f.name}</div>
      <div class="card-desc cd-${f.rarity}">${f.desc}</div>
      <button class="btn-use bu-${f.rarity}" onclick="useFrame(${idx})">
        ✦ ¡Usar este frame! ✦
      </button>
    </div>
  `;

  ol.classList.add('show');

  // Dibujar miniatura del frame en la carta
  setTimeout(() => {
    const pc = document.getElementById(pid);
    if (pc) {
      const ctx = pc.getContext('2d');
      f.draw(ctx, 60, 180);
    }
  }, 60);

  // Efecto especial para el frame SECRET
  if (idx === 2) {
    document.body.classList.add('shaking');
    setTimeout(() => document.body.classList.remove('shaking'), 600);
  }
}

/**
 * Confirma el uso del frame ganado:
 *   - Cierra el overlay
 *   - Activa el frame seleccionado
 *   - Actualiza el panel y el botón de foto
 * @param {number} idx - índice del frame
 */
function useFrame(idx) {
  document.getElementById('gachaOverlay').classList.remove('show');
  curFrame   = idx;
  hasRolled  = true;
  updateFramePanel(idx);
  updateSnapBtn();
  updateDeleteBtn();
}


/* ============================================================
   11. TEXTO DE CARGA ANIMADO
   ============================================================ */
const loadMsgs = [
  'Loading...',
  'Preparing frames...',
  'Waking up frogs...',
  'Almost ready!',
  '★ Ready!'
];

let loadIdx    = 0;
const loadEl   = document.getElementById('loadTxt');

setInterval(() => {
  loadIdx      = (loadIdx + 1) % loadMsgs.length;
  loadEl.textContent = loadMsgs[loadIdx];
}, 700);


/* ============================================================
   EVENTOS GLOBALES
   ============================================================ */

// Refresca los overlays cuando cambia el tamaño de la ventana
window.addEventListener('resize', refreshFrameOverlays);
