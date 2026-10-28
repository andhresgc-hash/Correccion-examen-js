import "./tarjeta-producto.js";

export class ListaProductos extends HTMLElement {
  set products(value) {
    this._products = value;
    this.renderizar();
  }

  renderizar() {
    if (!this._products) return;
    this.replaceChildren();

    if (this._products.length === 0) {
      const empty = document.createElement("div");
      empty.className = "estado-vacio";
      const title = document.createElement("strong");
      title.textContent = "No encontramos productos";
      const message = document.createElement("span");
      message.textContent = "Prueba con otros términos o limpia los filtros.";
      empty.append(title, message);
      this.append(empty);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "cuadricula-productos";
    for (const product of this._products) {
      const card = document.createElement("tarjeta-producto");
      card.product = product;
      grid.append(card);
    }
    this.append(grid);
  }
}

customElements.define("product-list", ListaProductos);
