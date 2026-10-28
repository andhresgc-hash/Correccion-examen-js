const STORAGE_KEY = "tecnostock-cart-v1";

export function leerCarrito() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { lines: [], warning: "" };

    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) {
      return { lines: [], warning: "El carrito guardado tenía un formato inválido y se inició uno nuevo." };
    }
    return { lines: saved, warning: "" };
  } catch (error) {
    const warning = error instanceof SyntaxError
      ? "El carrito guardado estaba dañado y se inició uno nuevo."
      : "No se pudo leer el almacenamiento del navegador. La sesión continuará sin carrito guardado.";
    return { lines: [], warning };
  }
}

export function guardarCarrito(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(
      Array.from(cart, ([id, quantity]) => ({ id, quantity })),
    ));
    return true;
  } catch {
    return false;
  }
}
