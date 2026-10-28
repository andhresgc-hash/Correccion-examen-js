import { obtenerProductos } from "./api.js";
import { calcularCarrito, restaurarCarrito, validarCarrito } from "./cart.js";
import { leerCarrito, guardarCarrito } from "./storage.js";
import "./components/product-list.js";
import "./components/shopping-cart.js";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});

const elements = {
  listaProductos: document.querySelector("#lista-productos"),
  carritoCompras: document.querySelector("#carrito-compras"),
  estadoCatalogo: document.querySelector("#estado-catalogo"),
  conteoResultados: document.querySelector("#conteo-resultados"),
  busqueda: document.querySelector("#entrada-busqueda"),
  categoria: document.querySelector("#filtro-categoria"),
  orden: document.querySelector("#filtro-orden"),
  disponibles: document.querySelector("#filtro-disponibles"),
  limpiarFiltros: document.querySelector("#limpiar-filtros"),
  conteoEncabezado: document.querySelector("#conteo-carrito-encabezado"),
  conteoCarrito: document.querySelector("#conteo-productos-carrito"),
  unidadesResumen: document.querySelector("#resumen-unidades"),
  subtotalResumen: document.querySelector("#resumen-subtotal"),
  descuentoResumen: document.querySelector("#resumen-descuento"),
  totalResumen: document.querySelector("#resumen-total"),
  confirmarPedido: document.querySelector("#confirmar-pedido"),
  notificacion: document.querySelector("#notificacion"),
  dialogoPedido: document.querySelector("#dialogo-pedido"),
  identificadorPedido: document.querySelector("#identificador-pedido"),
  detallesPedido: document.querySelector("#detalles-pedido"),
  cerrarDialogo: document.querySelector("#cerrar-dialogo"),
};

let products = [];
let cart = new Map();
let toastTimer;

function mostrarMensaje(message, isError = false) {
  elements.notificacion.textContent = message;
  elements.notificacion.classList.toggle("error", isError);
  elements.notificacion.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => elements.notificacion.classList.remove("visible"), 4200);
}

function guardarEstadoCarrito() {
  if (!guardarCarrito(cart)) {
    mostrarMensaje("No se pudo guardar el carrito en este navegador. La compra sigue disponible durante esta sesión.", true);
  }
}

function mostrarCarrito() {
  const totales = calcularCarrito(cart, products);
  elements.carritoCompras.data = totales;
  elements.conteoEncabezado.textContent = String(totales.units);
  elements.conteoCarrito.textContent = `${totales.lines.length} ${totales.lines.length === 1 ? "producto" : "productos"}`;
  elements.unidadesResumen.textContent = String(totales.units);
  elements.subtotalResumen.textContent = currency.format(totales.subtotal);
  elements.descuentoResumen.textContent = `− ${currency.format(totales.discount)}`;
  elements.totalResumen.textContent = currency.format(totales.total);
  elements.confirmarPedido.disabled = totales.lines.length === 0;
}

function mostrarProductos() {
  const query = elements.busqueda.value.trim().toLocaleLowerCase("es");
  const category = elements.category.value;
  const onlyAvailable = elements.disponibles.checked;
  const sort = elements.orden.value;

  const visibleProducts = products.filter((product) => {
    const searchable = `${product.name} ${product.description}`.toLocaleLowerCase("es");
    const matchesQuery = !query || searchable.includes(query);
    const matchesCategory = !category || product.category === category;
    const matchesAvailability = !onlyAvailable || (product.active && product.stock > 0);
    return matchesQuery && matchesCategory && matchesAvailability;
  });

  if (sort === "price-asc") visibleProducts.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") visibleProducts.sort((a, b) => b.price - a.price);
  elements.listaProductos.products = visibleProducts;
  elements.conteoResultados.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "producto" : "productos"}`;
}

function cargarCategorias() {
  const categories = [...new Set(products.map((product) => product.category))]
    .sort((a, b) => a.localeCompare(b, "es"));
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.category.append(option);
  }
}

function agregarProducto(productId) {
  const product = products.find((item) => String(item.id) === String(productId));
  if (!product) {
    mostrarMensaje("No se encontró el producto seleccionado en el catálogo.", true);
    return;
  }
  if (!product.active || product.stock < 1) {
    mostrarMensaje(`"${product.name}" no está disponible para agregar.`, true);
    return;
  }

  const id = String(product.id);
  const currentQuantity = cart.get(id) || 0;
  if (currentQuantity + 1 > product.stock) {
    mostrarMensaje(`Solo hay ${product.stock} unidades disponibles de "${product.name}".`, true);
    return;
  }

  cart.set(id, currentQuantity + 1);
  guardarEstadoCarrito();
  mostrarCarrito();
  mostrarMensaje(`${product.name} se agregó al carrito.`);
}

function modificarCarrito({ accion, productId }) {
  if (accion === "vaciar") {
    if (cart.size === 0) return;
    cart.clear();
    guardarEstadoCarrito();
    mostrarCarrito();
    mostrarMensaje("Se vació el carrito.");
    return;
  }

  const id = String(productId);
  const product = products.find((item) => String(item.id) === id);
  const quantity = cart.get(id);
  if (!product || !quantity) {
    mostrarMensaje("No se pudo modificar esa línea del carrito.", true);
    return;
  }

  if (accion === "eliminar") {
    cart.delete(id);
  } else if (accion === "disminuir") {
    if (quantity <= 1) {
      mostrarMensaje("La cantidad mínima por línea es 1.", true);
      return;
    }
    cart.set(id, quantity - 1);
  } else if (accion === "aumentar") {
    if (!product.active || quantity + 1 > product.stock) {
      mostrarMensaje(`No puedes superar las ${product.stock} unidades disponibles de "${product.name}".`, true);
      return;
    }
    cart.set(id, quantity + 1);
  } else {
    mostrarMensaje("La operación solicitada no es válida.", true);
    return;
  }

  guardarEstadoCarrito();
  mostrarCarrito();
}

function crearIdentificadorPedido() {
  if (typeof crypto.randomUUID === "function") return `TS-${crypto.randomUUID()}`;
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  return `TS-${Date.now().toString(36)}-${randomPart}`;
}

function mostrarResumenPedido(totales, orderId) {
  elements.identificadorPedido.textContent = orderId;
  elements.detallesPedido.replaceChildren();

  const agregarFilaResumen = (label, value, isTotal = false) => {
    const row = document.createElement("div");
    row.className = "fila-detalle-pedido";
    const name = document.createElement("span");
    name.textContent = label;
    const amount = document.createElement("strong");
    amount.textContent = value;
    if (isTotal) amount.style.color = "#087354";
    row.append(name, amount);
    elements.detallesPedido.append(row);
  };

  for (const line of totales.lines) {
    agregarFilaResumen(`${line.product.name} × ${line.quantity}`, currency.format(line.subtotal));
  }
  agregarFilaResumen("Subtotal", currency.format(totales.subtotal));
  agregarFilaResumen("Descuento", `− ${currency.format(totales.discount)}`);
  agregarFilaResumen("Total del pedido", currency.format(totales.total), true);
  elements.dialogoPedido.showModal();
}

function confirmarCompra() {
  const validacion = validarCarrito(cart, products);
  if (!validacion.valid) {
    mostrarMensaje(validacion.message, true);
    return;
  }

  const totales = calcularCarrito(cart, products);
  const orderId = crearIdentificadorPedido();
  mostrarResumenPedido(totales, orderId);
  cart.clear();
  guardarEstadoCarrito();
  mostrarCarrito();
}

async function inicializarAplicacion() {
  try {
    products = await obtenerProductos();
    cargarCategorias();
    const savedCart = leerCarrito();
    cart = restaurarCarrito(savedCart.lines, products);
    mostrarProductos();
    mostrarCarrito();
    elements.estadoCatalogo.textContent = products.length === 0
      ? "El catálogo se cargó correctamente, pero todavía no tiene productos."
      : "";

    if (savedCart.warning) mostrarMensaje(savedCart.warning, true);
    if (savedCart.lines.length > cart.size) {
      mostrarMensaje("Se descartaron líneas guardadas inválidas o no disponibles del carrito.", true);
    }
  } catch (error) {
    elements.estadoCatalogo.textContent = error instanceof Error
      ? error.message
      : "Ocurrió un error inesperado al cargar el catálogo.";
    elements.estadoCatalogo.classList.add("error");
    elements.conteoResultados.textContent = "";
    elements.listaProductos.products = [];
    mostrarCarrito();
  }
}

elements.busqueda.addEventListener("input", mostrarProductos);
elements.category.addEventListener("change", mostrarProductos);
elements.orden.addEventListener("change", mostrarProductos);
elements.disponibles.addEventListener("change", mostrarProductos);
elements.limpiarFiltros.addEventListener("click", () => {
  elements.busqueda.value = "";
  elements.category.value = "";
  elements.orden.value = "";
  elements.disponibles.checked = false;
  mostrarProductos();
});
elements.listaProductos.addEventListener("add-to-cart", (event) => agregarProducto(event.detail.productId));
elements.carritoCompras.addEventListener("cart-change", (event) => modificarCarrito(event.detail));
elements.confirmarPedido.addEventListener("click", confirmarCompra);
elements.cerrarDialogo.addEventListener("click", () => elements.dialogoPedido.close());
elements.dialogoPedido.addEventListener("click", (event) => {
  if (event.target === elements.dialogoPedido) elements.dialogoPedido.close();
});

inicializarAplicacion();
