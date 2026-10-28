# TecnoStock

Aplicación local de catálogo y preparación de pedidos, construida con HTML, CSS y JavaScript nativo.

## Ejecutar

El catálogo se carga con `fetch()`, por lo que la página debe abrirse desde un servidor HTTP local y no directamente como archivo `file://`.

Desde la carpeta del proyecto, puedes iniciar un servidor sencillo con Python:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000` en el navegador.

## Funcionalidades

- Catálogo JSON validado, estados de carga, error y catálogo vacío.
- Búsqueda, categoría, disponibilidad y orden de precios combinables.
- Componentes personalizados `<product-card>`, `<product-list>` y `<shopping-cart>`.
- Carrito con cantidades limitadas por inventario y precios obtenidos del catálogo.
- Persistencia validada en `localStorage` y descuento del 10 % desde $300.000 COP.
- Confirmación de pedido simulada, con resumen e identificador único; no procesa pagos ni actualiza inventario.
