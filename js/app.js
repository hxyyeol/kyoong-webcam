// ══════════════════════════════════════════════════════════
//  KYOONG WEB CAM — app.js
// ══════════════════════════════════════════════════════════

// ── BGM ──
const bgm = new Audio('assets/Elevator.mp3');
bgm.loop = true;
bgm.volume = 0.6;

// ── FRAMES ──
const FRAMES = [
  {
    id:      0,
    rarity:  'cute',
    name:    '0506 BBH',
    label:   '✦ CUTE ✦',
    layout:  'vertical',
    src:     'assets/0605BBH.png',
    pct:     45,
    canvasW: 600,
    canvasH: 1800
  },
  {
    id:      1,
    rarity:  'lovely',
    name:    'Kyoong Film',
    label:   '★ LOVELY ★',
    layout:  'grid',
    src:     'assets/KyoongFilm.png',
    pct:     40,
    canvasW: 1200,
    canvasH: 1800
  },
  {
    id:      2,
    rarity:  'secret',
    name:    'Love You, Eri!',
    label:   '!? SECRET !?',
    layout:  'vertical',
    src:     'assets/LoveYouEri.png',
    pct:     15,
    canvasW: 600,
    canvasH: 1800
  }
];

const FRAME_IMGS = {};
FRAMES.forEach(f => {
  const img = new Image();
  img.src = f.src;
  FRAME_IMGS[f.id] = img;
});

let state = {
  frame:       null,
  rolledFrame: null,
  shots:       [null, null, null, null],
  camOn:       false,
  camStream:   null
};

// ═══════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════
function startGame() {
  document.getElementById('startScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');
  applyStripLayout();
  updateFrameUI();
  bgm.play().catch(() => {});
}

// ═══════════════════════════════════════════════════════════
//  GACHA
// ═══════════════════════════════════════════════════════════
function doRoll() {
  const r = Math.random() * 100;
  const f = FRAMES[r < 45 ? 0 : r < 85 ? 1 : 2];
  state.rolledFrame = f;

  document.getElementById('gachaCard').className  = 'g-card gc-' + f.rarity;
  document.getElementById('cardRarity').textContent = f.label;

  const cardImg = document.getElementById('cardIconImg');
  cardImg.src             = f.src;
  cardImg.style.width     = f.layout === 'grid' ? '128px' : '64px';
  cardImg.style.height    = '192px';
  cardImg.style.objectFit = 'contain';

  document.getElementById('cardName').className   = 'card-name cn-' + f.rarity;
  document.getElementById('cardName').textContent = f.name;
  document.getElementById('btnUse').className     = 'btn-use bu-' + f.rarity;
  document.getElementById('gachaOverlay').classList.add('show');

  if (f.rarity === 'secret') {
    document.body.classList.add('shaking');
    setTimeout(() => document.body.classList.remove('shaking'), 600);
  }
}

function closeGacha() {
  document.getElementById('gachaOverlay').classList.remove('show');
  state.rolledFrame = null;
}

function useFrame() {
  state.frame = state.rolledFrame;
  document.getElementById('gachaOverlay').classList.remove('show');
  state.rolledFrame = null;
  updateFrameUI();
  updateActiveSlot();
  updateButtons();
}

// ═══════════════════════════════════════════════════════════
//  FRAME UI
// ═══════════════════════════════════════════════════════════
function updateFrameUI() {
  const f     = state.frame;
  const thumb = document.getElementById('frameThumbnail');

  if (f) {
    thumb.innerHTML = '';
    const img = document.createElement('img');
    img.src = f.src;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    thumb.appendChild(img);
  } else {
    thumb.innerHTML = `<div class="lock-inner">
      <svg width="20" height="20" viewBox="0 0 16 16" style="image-rendering:pixelated">
        <g fill="#1A0033">
          <rect x="5" y="2" width="6" height="1"/><rect x="4" y="3" width="1" height="4"/>
          <rect x="11" y="3" width="1" height="4"/><rect x="5" y="3" width="1" height="1"/>
          <rect x="10" y="3" width="1" height="1"/><rect x="2" y="7" width="12" height="1"/>
          <rect x="2" y="13" width="12" height="1"/><rect x="1" y="8" width="1" height="5"/>
          <rect x="14" y="8" width="1" height="5"/>
        </g>
        <rect x="2" y="8" width="12" height="5" fill="#FFEC00"/>
        <rect x="7" y="9" width="2" height="2" fill="#1A0033"/>
        <rect x="7" y="11" width="2" height="2" fill="#1A0033"/>
        <rect x="2" y="8" width="2" height="1" fill="#FFF6D9"/>
      </svg>
      <span style="font-family:monospace;font-size:4px;color:#FFF6D9;letter-spacing:1px">ROLL</span>
    </div>`;
  }

  document.getElementById('fiStatus').textContent = f ? '✦ FRAME' : 'NO FRAME';
  const nm = document.getElementById('fiName');
  nm.textContent = f ? f.name : '— — —';
  nm.className   = 'fi-name' + (f ? '' : ' empty');
  document.getElementById('rollBlink').style.display = f ? 'none' : '';
}

// ═══════════════════════════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════════════════════════
async function toggleCam() {
  if (state.camOn) return;
  try {
    state.camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });
    document.getElementById('camVideo').srcObject = state.camStream;
    state.camOn = true;
    document.getElementById('noCamPanel').style.display = 'none';
    updateActiveSlot();
    updateButtons();
  } catch(e) {
    alert('Please allow camera access 📷');
  }
}

// ═══════════════════════════════════════════════════════════
//  STRIP LAYOUT
// ═══════════════════════════════════════════════════════════
//
//  BUG RAÍZ (detectado en captura):
//  El CSS .strip-slot.active-slot { flex: 5 } expande el slot activo a ~70%
//  del strip. Con un frame de 4 cutouts iguales, la cámara aparece en
//  múltiples cutouts al mismo tiempo.
//
//  FIX: cuando hay un frame activo, forzar flex:1 en todos los slots
//  vía inline style (que gana sobre el class CSS). Así cada slot ocupa
//  exactamente 25% del strip y la cámara sólo aparece en su cutout correcto.
//
//  Sin frame: flex:'' → deja que el CSS haga flex:5 en active-slot (UX normal)
//  Con frame: flex:'1' → todos iguales, cada uno alineado con su cutout
//
function applyStripLayout() {
  const strip  = document.getElementById('photoStrip');
  const f      = state.frame;
  const isGrid = f?.layout === 'grid';

  // Center strip with correct aspect ratio.
  // IMPORTANT: use 'auto' not '' — '' lets CSS class { inset:0 } win again.
  strip.style.position    = 'absolute';
  strip.style.inset       = 'auto';
  strip.style.top         = '50%';
  strip.style.left        = '50%';
  strip.style.right       = 'auto';
  strip.style.bottom      = 'auto';
  strip.style.transform   = 'translate(-50%, -50%)';
  strip.style.height      = '100%';
  strip.style.width       = 'auto';
  strip.style.maxWidth    = '100%';
  strip.style.maxHeight   = '100%';
  strip.style.overflow    = 'hidden';
  strip.style.aspectRatio = isGrid ? '2/3' : '1/3';
  strip.style.background  = f ? '#ffffff' : '#111111';

  if (isGrid) {
    // ── 2×2 grid ──
    strip.style.display             = 'grid';
    strip.style.gridTemplateColumns = '1fr 1fr';
    strip.style.gridTemplateRows    = '1fr 1fr';
    strip.style.flexDirection       = '';

    for (let i = 0; i < 4; i++) {
      const sl = document.getElementById('slot' + i);
      sl.style.flex        = 'unset';
      sl.style.width       = '100%';
      sl.style.height      = '100%';
      sl.style.borderBottom = 'none';
      sl.style.background  = 'transparent';
    }

  } else {
    // ── Vertical 1×4 ──
    strip.style.display             = 'flex';
    strip.style.flexDirection       = 'column';
    strip.style.gridTemplateColumns = '';
    strip.style.gridTemplateRows    = '';

    for (let i = 0; i < 4; i++) {
      const sl = document.getElementById('slot' + i);

      // ★ KEY FIX ★
      // With frame: force flex:1 so all slots stay equal (25% each).
      //   This prevents active-slot's CSS flex:5 from expanding the slot
      //   and bleeding the camera feed through multiple frame cutouts.
      // Without frame: clear inline flex so CSS handles expansion (flex:5 on active).
      sl.style.flex = f ? '1' : '';

      sl.style.width        = '';
      sl.style.height       = '';
      sl.style.borderBottom = '';
      sl.style.background   = f ? 'transparent' : '';
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  SLOTS — content
// ═══════════════════════════════════════════════════════════
function updateActiveSlot() {
  applyStripLayout();

  const ai = state.shots.findIndex(s => !s);

  for (let i = 0; i < 4; i++) {
    const sl = document.getElementById('slot' + i);
    sl.classList.remove('active-slot', 'taken');
    sl.querySelectorAll('video, img, .fo').forEach(e => e.remove());
    const sp = sl.querySelector('span');

    if (state.shots[i]) {
      // ── Captured photo ──
      sl.classList.add('taken');
      if (sp) sp.style.display = 'none';
      const img = document.createElement('img');
      img.className = 'photo-stub';
      img.src = state.shots[i];
      sl.insertBefore(img, sl.firstChild);

    } else if (i === ai && state.camOn) {
      // ── Active slot — live camera ──
      sl.classList.add('active-slot');
      if (sp) sp.style.display = 'none';
      const v = document.createElement('video');
      v.srcObject   = state.camStream;
      v.autoplay    = true;
      v.playsInline = true;
      v.muted       = true;
      v.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;transform:scaleX(-1)';
      sl.insertBefore(v, sl.firstChild);

      // Ensure the active slot doesn't expand when frame is active
      // (applyStripLayout already sets flex:1, but reinforce after classList changes)
      if (state.frame) sl.style.flex = '1';

    } else {
      // ── Empty slot ──
      if (sp) {
        sp.textContent   = 'slot ' + (i + 1);
        sp.style.display = state.frame ? 'none' : '';
      }
    }
  }

  // ── Frame PNG overlay ──
  const strip = document.getElementById('photoStrip');
  let fo = document.getElementById('liveFrameOverlay');

  if (state.frame) {
    if (!fo) {
      fo = document.createElement('img');
      fo.id = 'liveFrameOverlay';
      fo.style.position       = 'absolute';
      fo.style.top            = '0';
      fo.style.left           = '0';
      fo.style.right          = '0';
      fo.style.bottom         = '0';
      fo.style.width          = '100%';
      fo.style.height         = '100%';
      fo.style.objectFit      = 'fill';
      fo.style.pointerEvents  = 'none';
      fo.style.zIndex         = '5';
      fo.style.display        = 'block';
      strip.appendChild(fo);
    }
    fo.src = state.frame.src;
  } else if (fo) {
    fo.remove();
  }
}

// ═══════════════════════════════════════════════════════════
//  TAKE PHOTO
// ═══════════════════════════════════════════════════════════
function takePhoto() {
  if (!state.camOn || !state.frame) return;
  const ai = state.shots.findIndex(s => !s);
  if (ai < 0) return;

  const v   = document.getElementById('slot' + ai).querySelector('video');
  const tmp = document.getElementById('captureCanvas');

  if (v && v.videoWidth) {
    tmp.width  = v.videoWidth;
    tmp.height = v.videoHeight;
    const ctx  = tmp.getContext('2d');
    ctx.save();
    ctx.translate(tmp.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    ctx.restore();
    state.shots[ai] = tmp.toDataURL('image/jpeg', 1.0);
  } else {
    tmp.width = 200; tmp.height = 200;
    const ctx = tmp.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 200);
    g.addColorStop(0, '#EDD5FF'); g.addColorStop(1, '#FFB3D9');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 200, 200);
    state.shots[ai] = tmp.toDataURL();
  }

  const fl = document.getElementById('flash');
  fl.style.opacity = '1';
  setTimeout(() => fl.style.opacity = '0', 130);

  const cnt = state.shots.filter(Boolean).length;
  document.getElementById('shotCounter').textContent = String(cnt).padStart(2, '0') + ' / 04';
  updateActiveSlot();
  updateButtons();
  if (cnt === 4) setTimeout(showResult, 400);
}

function deleteShot() {
  const cnt = state.shots.filter(Boolean).length;
  if (!cnt) return;
  state.shots[cnt - 1] = null;
  document.getElementById('resultOverlay').classList.remove('show');
  document.getElementById('shotCounter').textContent = String(cnt - 1).padStart(2, '0') + ' / 04';
  updateActiveSlot();
  updateButtons();
}

// ═══════════════════════════════════════════════════════════
//  FINAL RESULT
// ═══════════════════════════════════════════════════════════
function showResult() {
  const shots = state.shots.filter(Boolean);
  if (shots.length < 4) return;

  const f      = state.frame;
  const isGrid = f?.layout === 'grid';
  const cW     = f?.canvasW ?? 200;
  const cH     = f?.canvasH ?? 600;

  document.getElementById('finalStripWrap').style.aspectRatio = isGrid ? '2/3' : '1/3';

  const c   = document.createElement('canvas');
  c.width   = cW;
  c.height  = cH;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cW, cH);

  let done = 0;
  shots.forEach((src, i) => {
    const img = new Image();
    img.onload = () => {
      if (isGrid) {
        const col   = i % 2;
        const row   = Math.floor(i / 2);
        drawCropped(ctx, img, col * (cW / 2), row * (cH / 2), cW / 2, cH / 2);
      } else {
        drawCropped(ctx, img, 0, i * (cH / 4), cW, cH / 4);
      }
      if (++done === 4) compositeAndShow(c, ctx, cW, cH);
    };
    img.src = src;
  });
}

function drawCropped(ctx, img, dx, dy, dw, dh) {
  const ir = img.width / img.height;
  const br = dw / dh;
  let sx, sy, sw, sh;
  if (ir > br) {
    sh = img.height; sw = sh * br; sx = (img.width - sw) / 2; sy = 0;
  } else {
    sw = img.width; sh = sw / br; sx = 0; sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function compositeAndShow(c, ctx, cW, cH) {
  const doIt = () => {
    if (state.frame) ctx.drawImage(FRAME_IMGS[state.frame.id], 0, 0, cW, cH);
    const wrap = document.getElementById('finalStripWrap');
    wrap.innerHTML = '';
    const result = document.createElement('img');
    result.src = c.toDataURL('image/jpeg', 1.0);
    result.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
    wrap.appendChild(result);
    document.getElementById('resultOverlay').classList.add('show');
    window._sc = c;
  };
  if (state.frame) {
    const fi = FRAME_IMGS[state.frame.id];
    if (fi.complete && fi.naturalWidth > 0) doIt();
    else { fi.onload = doIt; if (!fi.src || fi.src === window.location.href) fi.src = state.frame.src; }
  } else {
    doIt();
  }
}

// ═══════════════════════════════════════════════════════════
//  DOWNLOAD / RESET
// ═══════════════════════════════════════════════════════════
function downloadStrip() {
  if (window._sc) {
    const a = document.createElement('a');
    a.download = 'kyoong-strip.jpg';
    a.href = window._sc.toDataURL('image/jpeg', 1.0);
    a.click();
  } else {
    alert('✨ Enable your camera for a real strip!');
  }
}

function newSession() {
  state.shots = [null, null, null, null];
  state.frame = null;
  window._sc  = null;
  document.getElementById('resultOverlay').classList.remove('show');
  document.getElementById('shotCounter').textContent = '00 / 04';
  document.getElementById('finalStripWrap').style.aspectRatio = '1/3';
  updateActiveSlot();
  updateFrameUI();
  updateButtons();
}

function updateButtons() {
  const cnt = state.shots.filter(Boolean).length;
  document.getElementById('btnSnap').disabled   = !(state.camOn && state.frame && cnt < 4);
  document.getElementById('btnDelete').disabled = !cnt;
}
