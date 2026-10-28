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

    const visual = document.createElement("div");
    visual.className = "visual-producto";
    const category = document.createElement("span");
    category.className = "categoria-producto";
    category.textContent = product.category;
    const stock = document.createElement("span");
    stock.className = `etiqueta-existencias${available ? "" : " agotado"}`;
    stock.textContent = available ? `${product.stock} disponibles` : (product.active ? "Agotado" : "No disponible");
    const emoji = document.createElement("span");
    emoji.className = "icono-producto";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = obtenerIconoProducto(product.name);
    visual.append(category, stock, emoji);

    const info = document.createElement("div");
    info.className = "informacion-producto";
    const title = document.createElement("h3");
    title.textContent = product.name;
    const description = document.createElement("p");
    description.className = "descripcion-producto";
    description.textContent = product.description;
    const bottom = document.createElement("div");
    bottom.className = "pie-producto";
    const price = document.createElement("strong");
    price.className = "precio-producto";
    price.textContent = new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", maximumFractionDigits: 0,
    }).format(product.price);
    const button = document.createElement("button");
    button.className = "boton-agregar";
    button.type = "button";
    button.disabled = !available;
    button.textContent = available ? "＋ Agregar" : "No disponible";
    button.setAttribute("aria-label", `${available ? "Agregar" : "No disponible"} ${product.name} al carrito`);
    button.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("add-to-cart", {
        detail: { productId: product.id },
        bubbles: true,
        composed: true,
      }));
    });
    bottom.append(price, button);
    info.append(title, description, bottom);
    this.append(visual, info);
  }
}

customElements.define("tarjeta-producto", TarjetaProducto);
