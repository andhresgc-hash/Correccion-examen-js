const CATALOG_URL = "../data/products.json";

function esProductoValido(product) {
  return product !== null
    && typeof product === "object"
    && (typeof product.id === "number" || typeof product.id === "string")
    && String(product.id).trim() !== ""
    && typeof product.name === "string"
    && product.name.trim() !== ""
    && typeof product.category === "string"
    && product.category.trim() !== ""
    && typeof product.price === "number"
    && Number.isFinite(product.price)
    && product.price > 0
    && Number.isInteger(product.stock)
    && product.stock >= 0
    && typeof product.description === "string"
    && typeof product.active === "boolean";
}

export async function obtenerProductos() {
  let response;
  try {
    response = await fetch(CATALOG_URL);
  } catch (error) {
    throw new Error("No fue posible conectar con el catálogo. Comprueba que estés usando un servidor HTTP local.", { cause: error });
  }

  if (!response.ok) {
    throw new Error(`El catálogo respondió con un error HTTP (${response.status}).`);
  }

  let products;
  try {
    products = await response.json();
  } catch (error) {
    throw new Error("El archivo del catálogo no contiene un JSON válido.", { cause: error });
  }

  if (!Array.isArray(products)) {
    throw new Error("El catálogo tiene un formato inválido: se esperaba una lista de productos.");
  }

  const identifiers = new Set();
  for (const product of products) {
    if (!esProductoValido(product)) {
      throw new Error("El catálogo contiene un producto con datos inválidos.");
    }

    const identifier = String(product.id);
    if (identifiers.has(identifier)) {
      throw new Error("El catálogo contiene identificadores de producto repetidos.");
    }
    identifiers.add(identifier);
  }

  return products;
}
