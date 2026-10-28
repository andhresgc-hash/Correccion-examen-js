import { obtenerIconoProducto } from "./product-card.js";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});

export class CarritoCompras extends HTMLElement {
  set data(value) {
    this._data = value;
    this.renderizar();
  }

  renderizar() {
    if (!this._data) return;
    const { lines } = this._data;
    this.replaceChildren();
    const panel = document.createElement("div");
    panel.className = "panel-carrito";
    const heading = document.createElement("div");
    heading.className = "encabezado-panel-carrito";
    const title = document.createElement("strong");
    title.textContent = "Productos agregados";
    const clearButton = document.createElement("button");
    clearButton.className = "boton-texto";
    clearButton.type = "button";
    clearButton.disabled = lines.length === 0;
    clearButton.textContent = "Vaciar carrito";
    clearButton.addEventListener("click", () => this.emitirCambio("vaciar"));
    heading.append(title, clearButton);
    panel.append(heading);

    if (lines.length === 0) {
      const empty = document.createElement("div");
      empty.className = "carrito-vacio";
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "🛍";
      const message = document.createElement("strong");
      message.textContent = "Tu carrito está esperando";
      const hint = document.createElement("span");
      hint.textContent = "Agrega productos del catálogo para verlos aquí.";
      empty.append(icon, message, hint);
      panel.append(empty);
    } else {
      for (const line of lines) panel.append(this.crearLinea(line));
    }
    this.append(panel);
  }

  crearLinea(line) {
    const { product, quantity, subtotal } = line;
    const row = document.createElement("div");
    row.className = "linea-carrito";
    const icon = document.createElement("span");
    icon.className = "icono-linea-carrito";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = obtenerIconoProducto(product.name);
    const info = document.createElement("div");
    info.className = "informacion-linea-carrito";
    const name = document.createElement("strong");
    name.textContent = product.name;
    const unitPrice = document.createElement("span");
    unitPrice.textContent = `${currency.format(product.price)} c/u`;
    info.append(name, unitPrice);

    const quantityControl = document.createElement("div");
    quantityControl.className = "control-cantidad";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", `Disminuir cantidad de ${product.name}`);
    decrease.disabled = quantity <= 1;
    decrease.addEventListener("click", () => this.emitirCambio("disminuir", product.id));
    const count = document.createElement("span");
    count.textContent = String(quantity);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Aumentar cantidad de ${product.name}`);
    increase.disabled = quantity >= product.stock;
    increase.addEventListener("click", () => this.emitirCambio("aumentar", product.id));
    quantityControl.append(decrease, count, increase);

    const total = document.createElement("div");
    total.className = "total-linea";
    const amount = document.createElement("strong");
    amount.textContent = currency.format(subtotal);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Eliminar";
    remove.setAttribute("aria-label", `Eliminar ${product.name} del carrito`);
    remove.addEventListener("click", () => this.emitirCambio("eliminar", product.id));
    total.append(amount, remove);
    row.append(icon, info, quantityControl, total);
    return row;
  }

  emitirCambio(accion, productId) {
    this.dispatchEvent(new CustomEvent("cart-change", {
      detail: { accion, productId },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define("shopping-cart", CarritoCompras);
