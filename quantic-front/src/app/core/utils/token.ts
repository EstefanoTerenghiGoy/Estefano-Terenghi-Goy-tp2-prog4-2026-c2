export interface TiempoToken {
  iat: number;
  exp: number;
}

export function decodificarToken(token: string | null): TiempoToken | null {
  try {
    const payload = token?.split('.')[1];
    if (!payload) {
      return null;
    }
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const datos = JSON.parse(new TextDecoder().decode(bytes));
    return Number.isFinite(datos.iat) && Number.isFinite(datos.exp)
      ? { iat: datos.iat, exp: datos.exp }
      : null;
  } catch {
    return null;
  }
}
