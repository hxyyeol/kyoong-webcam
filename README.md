# Kyoong Web Cam ★
**Gacha Photo Booth — Staff Frames Edition**

Photobooth web con sistema gacha para obtener frames de foto estilo purikura (strip 2×6 pulgadas).

---

## 📁 Estructura del proyecto

```
kyoong-webcam/
├── index.html          ← HTML principal
├── css/
│   └── style.css       ← Todos los estilos + animaciones
├── js/
│   ├── frames.js       ← Datos y funciones draw() de los 3 frames
│   └── app.js          ← Lógica completa de la app
├── assets/             ← Carpeta para tus PNGs de frames (opcional)
│   ├── frame-0614-bbh.png
│   ├── frame-kyoong-shot.png
│   └── frame-love-you-eri.png
└── README.md
```

---

## 🎮 Cómo funciona

1. El jugador entra y presiona **START**
2. Activa la cámara con **📷 Cámara**
3. Hace **🎲 Roll** para obtener un frame aleatorio (gacha)
4. Toma **4 fotos** con **✨ ¡FOTO!**
5. Descarga su strip completo en PNG

### Probabilidades del gacha
| Frame | Rareza | Probabilidad |
|---|---|---|
| 0614 BBH | CUTE | 45% |
| Kyoong Shot! | LOVELY | 40% |
| Love You, Eri! | SECRET ⭐ | 15% |

---

## ✏️ Editar el proyecto

### Cambiar colores
Edita las variables CSS en `css/style.css`, sección **1. VARIABLES**:
```css
:root {
  --yellow:  #FFE234;   /* fondo principal */
  --pink2:   #FF5FAD;   /* botón foto, header */
  --green:   #7EDD62;   /* botón roll */
  /* ... */
}
```

### Cambiar nombres de frames
Edita en `js/frames.js`:
```javascript
{
  name:  '0614 BBH',      // ← nombre en la UI
  label: '✦ CUTE ✦',     // ← badge de rareza
  desc:  'Flowers...',    // ← descripción en la carta gacha
}
```

### Cambiar probabilidades
Edita en `js/frames.js` el campo `pct` de cada frame (deben sumar 100),
y en `js/app.js` la función `doGacha()`:
```javascript
// r < 45 → cute | r < 85 → lovely | resto → secret
showOverlay(r < 45 ? 0 : r < 85 ? 1 : 2);
```

### Cambiar número de fotos
En `js/app.js`:
```javascript
const MAX_SHOTS = 4;  // ← cambia a 3, 2, etc.
```

### Usar tus propios frames PNG
**Opción A — Sin tocar código (Staff Upload):**
1. Abre el juego → presiona **⚙ STAFF ACCESS**
2. Sube tus PNGs para cada frame
3. Presiona **✦ Aplicar Frames ✦**

> ⚠️ Los frames se pierden al recargar la página porque se cargan en memoria.

**Opción B — Permanente (en el código):**

En `js/frames.js`, agrega tus imágenes al inicio del archivo:
```javascript
const img0 = new Image(); img0.src = 'assets/frame-0614-bbh.png';
const img1 = new Image(); img1.src = 'assets/frame-kyoong-shot.png';
const img2 = new Image(); img2.src = 'assets/frame-love-you-eri.png';
```

Luego reemplaza la función `draw()` de cada frame:
```javascript
// Frame 0 — 0614 BBH
draw(ctx, w, h) {
  ctx.drawImage(img0, 0, 0, w, h);
}
```

### Requisitos del PNG
- Fondo **transparente** (PNG-24 con canal alpha)
- Proporción **1:3** — ej: 400×1200px o 600×1800px
- El **centro transparente** para que se vea la foto de la cámara
- Solo los **bordes con decoración**

---

## 🚀 Subir a GitHub Pages

1. Sube la carpeta a un repositorio en GitHub
2. Ve a **Settings → Pages**
3. En **Source** selecciona `main` y carpeta `/root`
4. Tu juego estará en `https://tuusuario.github.io/kyoong-webcam`

---

## 📱 Responsive
- **Móvil** (prioridad) — diseño vertical optimizado para touch
- **Tablet** — consola ligeramente más ancha
- **Desktop** — consola acotada y centrada, fuentes fijas

---

## 🛠 Tecnologías
- HTML5 + CSS3 + JavaScript vanilla
- Canvas API (frames + captura de fotos)
- MediaDevices API (cámara)
- Sin dependencias externas, sin frameworks

---

*Hecho con ♥ — Kyoong Staff 2025*
