export const DISCOUNT_THRESHOLD = 300000;
export const DISCOUNT_RATE = 0.1;

export function calcularCarrito(cart, products) {
  const productById = new Map(products.map((product) => [String(product.id), product]));
  const lines = [];
  let units = 0;
  let subtotal = 0;

  for (const [id, quantity] of cart) {
    const product = productById.get(String(id));
    if (!product) continue;

    const lineSubtotal = product.price * quantity;
    lines.push({ product, quantity, subtotal: lineSubtotal });
    units += quantity;
    subtotal += lineSubtotal;
  }

  const discount = subtotal >= DISCOUNT_THRESHOLD ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  return { lines, units, subtotal, discount, total: subtotal - discount };
}

export function restaurarCarrito(savedLines, products) {
  const restored = new Map();
  if (!Array.isArray(savedLines)) return restored;

  const productById = new Map(products.map((product) => [String(product.id), product]));
  for (const line of savedLines) {
    if (!line || typeof line !== "object") continue;
    const product = productById.get(String(line.id));
    if (!product || !product.active || product.stock < 1) continue;
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > product.stock) continue;
    restored.set(String(product.id), line.quantity);
  }

  return restored;
}

export function validarCarrito(cart, products) {
  const productById = new Map(products.map((product) => [String(product.id), product]));
  if (cart.size === 0) return { valid: false, message: "Agrega al menos un producto antes de confirmar el pedido." };

  for (const [id, quantity] of cart) {
    const product = productById.get(String(id));
    if (!product || !product.active || product.stock < 1) {
      return { valid: false, message: `El producto ${id} ya no está disponible. El carrito se conservó para que puedas revisarlo.` };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
      return { valid: false, message: `La cantidad de "${product.name}" supera las existencias disponibles.` };
    }
  }

  return { valid: true, message: "" };
}
