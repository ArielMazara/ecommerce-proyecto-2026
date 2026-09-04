const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type FiltrosProductos = {
  varietal?: string;
  bodega?: string;
  anada?: string;
  precioMin?: string;
  precioMax?: string;
};

export async function obtenerProductos(filtros: FiltrosProductos = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor);
  });

  const query = params.toString();
  const res = await fetch(`${API_URL}/productos${query ? `?${query}` : ""}`);

  if (!res.ok) throw new Error("No se pudieron cargar los productos");
  return res.json();
}

export async function obtenerProducto(id: string) {
  const res = await fetch(`${API_URL}/productos/${id}`);
  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
}
