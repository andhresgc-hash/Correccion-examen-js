const PRODUCT_ICONS = {
  "teclado": "⌨️",
  "mouse": "🖱️",
  "audífonos": "🎧",
  "webcam": "📷",
  "hub": "🔌",
  "base": "💻",
  "parlante": "🔊",
  "memoria": "💾",
  "disco": "🗄️",
  "micrófono": "🎙️",
  "pad": "🖱️",
  "adaptador": "🔗",
};

export function obtenerIconoProducto(name) {
  const key = Object.keys(PRODUCT_ICONS).find((word) => name.toLocaleLowerCase("es").includes(word));
  return key ? PRODUCT_ICONS[key] : "✨";
}

export class TarjetaProducto extends HTMLElement {
  set product(value) {
    this._product = value;
    this.renderizar();
  }

  renderizar() {
    if (!this._product) return;
    const product = this._product;
    const available = product.active && product.stock > 0;
    this.className = "tarjeta-producto";
    this.replaceChildren();

    const info = document.createElement("div");
    info.className = "informacion-producto";
    const title = document.createElement("h3");
    title.textContent = product.name;
    const description = document.createElement("p");
    description.className = "descripcion-producto";
    description.textContent = product.description;
    const bottom = document.createElement("div");
    bottom.className = "pie-producto";
    const button = document.createElement("button");
    button.className = "boton-agregar";
    button.type = "button";
    button.disabled = !available;
    button.textContent = available ? "Agregar al carrito" : "No disponible";
    button.setAttribute("aria-label", `${available ? "Agregar" : "No disponible"} ${product.name} al carrito`);
    button.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("add-to-cart", {
        detail: { productId: product.id },
        bubbles: true,
        composed: true,
      }));
    });
    bottom.append(button);
    info.append(title, description, bottom);
    this.append(info);
  }
}

customElements.define("product-card", TarjetaProducto);
