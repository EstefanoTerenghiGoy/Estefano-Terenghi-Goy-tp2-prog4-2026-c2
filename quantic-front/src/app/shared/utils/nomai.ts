// Utilidades puras para la escritura "Nomai" (espirales y glifos) de las transmisiones

export interface EspiralDef {
  cx: number;
  cy: number;
  r: number;
  start: number;
  dir: number;
  seed: number;
}

// Camino SVG de una espiral irregular, como un trazo hecho a mano
export function espiral(s: EspiralDef, tMax: number): string {
  const pts: string[] = [];
  const k = Math.max(s.r / 70, 0.55);
  for (let t = 0; t <= tMax; t += 0.09) {
    const base = s.r * Math.pow(0.84, t);
    const j =
      (Math.sin(t * 17 + s.seed) * 0.9 + Math.sin(t * 31 + s.seed * 1.7) * 0.6) *
      ((base / s.r) * 0.8 + 0.3) *
      k;
    const r = base + j;
    const a = s.start + s.dir * t;
    pts.push((s.cx + r * Math.cos(a)).toFixed(1) + ' ' + (s.cy + r * Math.sin(a)).toFixed(1));
  }
  return 'M' + pts.join(' L');
}

// Espiral "hija" que nace de un punto (t) de la espiral padre
export function rama(p: EspiralDef, t: number, r: number, dir: number, seed: number): EspiralDef {
  const pr = p.r * Math.pow(0.84, t);
  const pa = p.start + p.dir * t;
  const ux = Math.cos(pa);
  const uy = Math.sin(pa);
  const px = p.cx + pr * ux;
  const py = p.cy + pr * uy;
  return { cx: px + r * ux, cy: py + r * uy, r, start: pa + Math.PI, dir, seed };
}

// Texto -> glifos. Las letras se pasan a mayúsculas/minúsculas sin acentos; lo que no es letra
// (números, signos) queda como un punto medio
export function aGlifos(texto: string): string {
  const G = Array.from('⏃⏚☊⎅⟒⎎☌⊑⟟⟊☍⌰⋔⋏⍜⌿⍾⍀⌇⏁⎍⎐⍙⌖⊬⋉');
  const s = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  let out = '';
  for (const ch of s) {
    const code = ch.charCodeAt(0) - 97;
    if (ch === ' ') {
      out += ' ';
    } else if (code >= 0 && code < 26) {
      out += G[code];
    } else {
      out += '⋅';
    }
  }
  return out;
}

// Hash simple de un texto a un número entero positivo (para semillas estables a partir del _id)
export function hashTexto(texto: string): number {
  let h = 5381;
  for (const ch of texto) {
    h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
  }
  return Math.abs(h);
}

// Primer punto de un camino generado por espiral(): "M x y L ..."
export function inicioDe(d: string): { x: number; y: number } {
  const [x, y] = d.slice(1).split(' L')[0].split(' ').map(Number);
  return { x, y };
}
