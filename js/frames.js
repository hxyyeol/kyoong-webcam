/* ============================================================
   KYOONG WEB CAM — js/frames.js
   ============================================================
   Aquí defines los 3 frames del juego.
   Cada frame es un objeto con:
     - id      : índice (0, 1, 2)
     - name    : nombre que aparece en la UI
     - rarity  : 'cute' | 'lovely' | 'secret'
     - label   : texto del badge de rareza
     - emoji   : emoji representativo
     - pct     : probabilidad en el gacha (deben sumar 100)
     - desc    : descripción corta
     - draw(ctx, w, h) : función que dibuja el frame sobre canvas

   La función draw recibe:
     ctx  → CanvasRenderingContext2D
     w    → ancho del canvas (strip)
     h    → alto del canvas  (strip, siempre ≈ 3× el ancho)

   Para reemplazar un frame por tu PNG, cambia su draw() a:
     draw(ctx, w, h) {
       ctx.drawImage(miImagen, 0, 0, w, h);
     }
   (donde miImagen es un objeto Image cargado con src)
   ============================================================ */

const FRAMES = [

  /* ──────────────────────────────────────────
     FRAME 0 — 0614 BBH
     Rareza: CUTE  |  Probabilidad: 45%
  ────────────────────────────────────────── */
  {
    id:     0,
    name:   '0614 BBH',
    rarity: 'cute',
    label:  '✦ CUTE ✦',
    emoji:  '🌸',
    pct:    45,
    desc:   'Flowers & birthday stickers',

    draw(ctx, w, h) {
      const bw    = Math.round(w * 0.088);
      const slotH = h / 4;

      /* ── Borde holográfico lavanda › fuchsia › cyan ── */
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0,    '#EDD5FF');
      g.addColorStop(.25,  '#FF6BAE');
      g.addColorStop(.5,   '#7DD9FF');
      g.addColorStop(.75,  '#FF6BAE');
      g.addColorStop(1,    '#EDD5FF');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, bw);
      ctx.fillRect(0, h - bw, w, bw);
      ctx.fillRect(0, 0, bw, h);
      ctx.fillRect(w - bw, 0, bw, h);

      /* ── Shimmer de diamante en el borde ── */
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      for (let i = 0; i < 60; i++) {
        const edge = i % 4, r = 1.2 + Math.random() * 1.8;
        let sx, sy;
        if      (edge === 0) { sx = Math.random() * w;        sy = Math.random() * bw; }
        else if (edge === 1) { sx = Math.random() * w;        sy = h - Math.random() * bw; }
        else if (edge === 2) { sx = Math.random() * bw;       sy = Math.random() * h; }
        else                 { sx = w - Math.random() * bw;   sy = Math.random() * h; }
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ── Líneas divisoras entre slots ── */
      ctx.strokeStyle = 'rgba(255,255,255,.4)';
      ctx.lineWidth   = 1.5;
      [1, 2, 3].forEach(i => {
        ctx.beginPath();
        ctx.moveTo(bw, i * slotH);
        ctx.lineTo(w - bw, i * slotH);
        ctx.stroke();
      });

      /* ── Corazones stellados en los laterales ── */
      const star4 = (cx, cy, r, c) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a  = i * Math.PI / 4 - Math.PI / 8;
          const rd = i % 2 === 0 ? r : r * .38;
          i === 0
            ? ctx.moveTo(cx + Math.cos(a) * rd, cy + Math.sin(a) * rd)
            : ctx.lineTo(cx + Math.cos(a) * rd, cy + Math.sin(a) * rd);
        }
        ctx.closePath(); ctx.fill();
      };

      const sColors = ['white', '#FFB3D9', '#7DD9FF', '#EDD5FF'];
      for (let i = 0; i < 18; i++) {
        const x = i % 2 === 0 ? bw * .5 : w - bw * .5;
        const y = (i / 18) * h;
        star4(x, y, bw * .28, sColors[i % sColors.length]);
      }

      /* ── Flores Y2K en las 4 esquinas ── */
      const flower = (cx, cy, r) => {
        ['#FFB3D9', '#EDD5FF', '#7DD9FF', '#FF6BAE', '#C9AAFF'].forEach((c, i) => {
          const a = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * r * .52, cy + Math.sin(a) * r * .52, r * .38, r * .22, a, 0, Math.PI * 2);
          ctx.fillStyle = c; ctx.fill();
        });
        ctx.beginPath(); ctx.arc(cx, cy, r * .26, 0, Math.PI * 2);
        ctx.fillStyle = 'white'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, r * .13, 0, Math.PI * 2);
        ctx.fillStyle = '#FF2D78'; ctx.fill();
      };

      [[bw*.5, bw*.5], [w-bw*.5, bw*.5], [bw*.5, h-bw*.5], [w-bw*.5, h-bw*.5]]
        .forEach(([x, y]) => flower(x, y, bw * .72));

      /* ── Banda inferior fuchsia ── */
      ctx.fillStyle = 'rgba(255,45,120,.92)';
      ctx.fillRect(0, h - bw, w, bw);
      ctx.font         = `bold ${bw * .52}px 'Lilita One',cursive`;
      ctx.fillStyle    = 'white';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle  = 'rgba(26,0,51,.3)';
      ctx.lineWidth    = 2;
      ctx.strokeText('★ 0614 BBH ★', w / 2, h - bw * .5);
      ctx.fillText('★ 0614 BBH ★',   w / 2, h - bw * .5);

      /* ── Banda superior lavanda ── */
      ctx.fillStyle = 'rgba(201,170,255,.96)';
      ctx.fillRect(0, 0, w, bw);
      ctx.font         = `bold ${bw * .46}px 'Lilita One',cursive`;
      ctx.fillStyle    = '#1A0033';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('KYOONG WEB CAM', w / 2, bw * .5);
    }
  },


  /* ──────────────────────────────────────────
     FRAME 1 — Kyoong Shot!
     Rareza: LOVELY  |  Probabilidad: 40%
  ────────────────────────────────────────── */
  {
    id:     1,
    name:   'Kyoong Shot!',
    rarity: 'lovely',
    label:  '★ LOVELY ★',
    emoji:  '💚',
    pct:    40,
    desc:   'Mint cosmos & golden stars',

    draw(ctx, w, h) {
      const bw    = Math.round(w * 0.092);
      const slotH = h / 4;

      /* ── Borde púrpura profundo Y2K ── */
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0,   '#1A0033');
      g.addColorStop(.35, '#2D0052');
      g.addColorStop(.65, '#3A006B');
      g.addColorStop(1,   '#1A0033');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, bw);      ctx.fillRect(0, h - bw, w, bw);
      ctx.fillRect(0, 0, bw, h);      ctx.fillRect(w - bw, 0, bw, h);

      /* ── Constelación de estrellas cyan en bordes ── */
      const cs = ['#7DD9FF', '#EDD5FF', 'white', '#FFB3D9', '#DBBFFF'];
      for (let i = 0; i < 90; i++) {
        const e = i % 4; let sx, sy;
        if      (e === 0) { sx = Math.random() * w;       sy = Math.random() * bw; }
        else if (e === 1) { sx = Math.random() * w;       sy = h - Math.random() * bw; }
        else if (e === 2) { sx = Math.random() * bw;      sy = Math.random() * h; }
        else              { sx = w - Math.random() * bw;  sy = Math.random() * h; }

        const r = .5 + Math.random() * 2.2;
        ctx.fillStyle = cs[Math.floor(Math.random() * cs.length)];
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();

        /* cruz de destello en las más grandes */
        if (r > 1.6) {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth   = .8;
          ctx.globalAlpha = .7;
          ctx.beginPath(); ctx.moveTo(sx - r*3, sy); ctx.lineTo(sx + r*3, sy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx, sy - r*3); ctx.lineTo(sx, sy + r*3); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      /* ── Divisores de slot iridiscentes ── */
      const dl = ctx.createLinearGradient(bw, 0, w - bw, 0);
      dl.addColorStop(0,   'rgba(125,217,255,0)');
      dl.addColorStop(.5,  'rgba(125,217,255,.4)');
      dl.addColorStop(1,   'rgba(125,217,255,0)');
      ctx.strokeStyle = dl;
      ctx.lineWidth   = 1.5;
      [1, 2, 3].forEach(i => {
        ctx.beginPath(); ctx.moveTo(bw, i*slotH); ctx.lineTo(w-bw, i*slotH); ctx.stroke();
      });

      /* ── Luna creciente Y2K en esquina superior derecha ── */
      ctx.beginPath(); ctx.arc(w - bw*.56, bw*.56, bw*.52, 0, Math.PI*2);
      ctx.fillStyle = '#FFEC00'; ctx.fill();
      ctx.beginPath(); ctx.arc(w - bw*.28, bw*.38, bw*.42, 0, Math.PI*2);
      ctx.fillStyle = '#2D0052'; ctx.fill();

      /* ── Glow cyan en esquinas ── */
      [[0,0], [w,0], [0,h], [w,h]].forEach(([gx,gy]) => {
        const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, bw*2);
        rg.addColorStop(0, 'rgba(125,217,255,.28)');
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
      });

      /* ── Banda inferior cyan glacial ── */
      ctx.fillStyle    = 'rgba(0,150,200,.96)';
      ctx.fillRect(0, h - bw, w, bw);
      ctx.font         = `bold ${bw*.5}px 'Lilita One',cursive`;
      ctx.fillStyle    = 'white';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle  = 'rgba(26,0,51,.4)';
      ctx.lineWidth    = 2;
      ctx.strokeText('★ Kyoong Shot! ★', w/2, h - bw*.5);
      ctx.fillText('★ Kyoong Shot! ★', w/2, h - bw*.5);

      /* ── Banda superior lavanda ── */
      ctx.fillStyle = 'rgba(125,217,255,.2)';
      ctx.fillRect(0, 0, w, bw);
      ctx.font      = `bold ${bw*.48}px 'Lilita One',cursive`;
      ctx.fillStyle = '#FFEC00';
      ctx.strokeStyle = 'rgba(26,0,51,.5)';
      ctx.lineWidth = 1.5;
      ctx.strokeText('✦ KYOONG WEB CAM ✦', w/2, bw*.5);
      ctx.fillText('✦ KYOONG WEB CAM ✦', w/2, bw*.5);
    }
  },


  /* ──────────────────────────────────────────
     FRAME 2 — Love You, Eri!
     Rareza: SECRET  |  Probabilidad: 15%
     ⚠️ Frame raro — difícil de obtener
  ────────────────────────────────────────── */
  {
    id:     2,
    name:   'Love You, Eri!',
    rarity: 'secret',
    label:  '!? SECRET !?',
    emoji:  '💛',
    pct:    15,
    desc:   'The rarest frame... for true fans',

    draw(ctx, w, h) {
      const bw    = Math.round(w * 0.096);
      const slotH = h / 4;

      /* ── Borde holográfico arcoíris Y2K ── */
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0,    '#FF2D78');
      g.addColorStop(.2,   '#DBBFFF');
      g.addColorStop(.4,   '#7DD9FF');
      g.addColorStop(.6,   '#FFEC00');
      g.addColorStop(.8,   '#FFB3D9');
      g.addColorStop(1,    '#FF2D78');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, bw);      ctx.fillRect(0, h - bw, w, bw);
      ctx.fillRect(0, 0, bw, h);      ctx.fillRect(w - bw, 0, bw, h);

      /* ── Overlay shimmer sobre el borde ── */
      const gH = ctx.createLinearGradient(0, 0, w, 0);
      gH.addColorStop(0,   'rgba(255,255,255,0)');
      gH.addColorStop(.3,  'rgba(255,255,255,.3)');
      gH.addColorStop(.5,  'rgba(255,255,255,.55)');
      gH.addColorStop(.7,  'rgba(255,255,255,.3)');
      gH.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.fillStyle = gH;
      ctx.fillRect(0, 0, w, bw);
      ctx.fillRect(0, h - bw, w, bw);

      /* ── Sparkles Y2K en bordes ── */
      const sparkles = ['✦', '★', '♥', '✿', '◆'];
      ctx.font      = `${bw*.44}px serif`;
      for (let i = 0; i < 22; i++) {
        const e = i % 4; let sx, sy;
        if      (e === 0) { sx = Math.random() * w;         sy = Math.random() * bw*.75; }
        else if (e === 1) { sx = Math.random() * w;         sy = h - Math.random() * bw*.75; }
        else if (e === 2) { sx = Math.random() * bw*.75;    sy = Math.random() * h; }
        else              { sx = w - Math.random() * bw*.75; sy = Math.random() * h; }
        const shimCols = ['rgba(255,255,255,.85)', 'rgba(255,236,0,.9)', 'rgba(255,45,120,.7)', 'rgba(125,217,255,.8)'];
        ctx.fillStyle = shimCols[i % shimCols.length];
        ctx.fillText(sparkles[i % sparkles.length], sx - bw*.2, sy + bw*.15);
      }

      /* ── Corazones en los laterales de cada slot ── */
      [.5, 1.5, 2.5].forEach(m => {
        const y = m * slotH;
        ctx.font      = `${bw*.65}px serif`;
        ctx.fillStyle = 'rgba(255,255,255,.82)';
        ctx.fillText('♥', bw*.05, y + bw*.22);
        ctx.fillText('♥', w - bw*.75, y + bw*.22);
      });

      /* ── Divisores punteados holográficos ── */
      const dp = ctx.createLinearGradient(bw, 0, w - bw, 0);
      dp.addColorStop(0,   'rgba(255,255,255,0)');
      dp.addColorStop(.5,  'rgba(255,255,255,.5)');
      dp.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.strokeStyle = dp;
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([5, 5]);
      [1, 2, 3].forEach(i => {
        ctx.beginPath(); ctx.moveTo(bw, i*slotH); ctx.lineTo(w-bw, i*slotH); ctx.stroke();
      });
      ctx.setLineDash([]);

      /* ── Shimmer glow en esquinas ── */
      [[0,0], [w,0], [0,h], [w,h]].forEach(([gx,gy]) => {
        const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, bw*2.5);
        rg.addColorStop(0, 'rgba(255,255,255,.28)');
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
      });

      /* ── Banda inferior — deep fuchsia con texto dorado ── */
      ctx.fillStyle    = 'rgba(184,0,85,.97)';
      ctx.fillRect(0, h - bw, w, bw);
      ctx.font         = `bold ${bw*.52}px 'Lilita One',cursive`;
      ctx.fillStyle    = '#FFEC00';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle  = 'rgba(26,0,51,.4)';
      ctx.lineWidth    = 2;
      ctx.strokeText('♥ Love You, Eri! ♥', w/2, h - bw*.5);
      ctx.fillText('♥ Love You, Eri! ♥',   w/2, h - bw*.5);

      /* ── Banda superior — deep purple con texto neon ── */
      ctx.fillStyle = 'rgba(26,0,51,.97)';
      ctx.fillRect(0, 0, w, bw);
      ctx.font         = `bold ${bw*.48}px 'Lilita One',cursive`;
      ctx.fillStyle    = '#FFEC00';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle  = 'rgba(255,45,120,.6)';
      ctx.lineWidth    = 2;
      ctx.strokeText('✦ KYOONG WEB CAM ✦', w/2, bw*.5);
      ctx.fillStyle = 'white';
      ctx.fillText('✦ KYOONG WEB CAM ✦', w/2, bw*.5);
    }
  }

]; // fin FRAMES
