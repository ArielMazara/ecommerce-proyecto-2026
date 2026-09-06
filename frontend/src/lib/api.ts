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

async function procesarRespuesta(res: Response) {
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(datos.error || "Ocurrió un error");
  return datos;
}

export async function registrarUsuario(datos: {
  nombre: string;
  email: string;
  contrasena: string;
  fechaNacimiento: string;
}) {
  const res = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return procesarRespuesta(res);
}

export async function iniciarSesion(datos: { email: string; contrasena: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return procesarRespuesta(res);
}

function headersAuth(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const EVENTO_CARRITO_ACTUALIZADO = "carrito-actualizado";

function avisarCarritoActualizado() {
  window.dispatchEvent(new Event(EVENTO_CARRITO_ACTUALIZADO));
}

export async function obtenerCarrito(token: string) {
  const res = await fetch(`${API_URL}/carrito`, { headers: headersAuth(token) });
  return procesarRespuesta(res);
}

export async function agregarAlCarrito(token: string, productoId: number, cantidad = 1) {
  const res = await fetch(`${API_URL}/carrito`, {
    method: "POST",
    headers: headersAuth(token),
    body: JSON.stringify({ productoId, cantidad }),
  });
  const datos = await procesarRespuesta(res);
  avisarCarritoActualizado();
  return datos;
}

export async function actualizarCantidadCarrito(token: string, productoId: number, cantidad: number) {
  const res = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: "PUT",
    headers: headersAuth(token),
    body: JSON.stringify({ cantidad }),
  });
  const datos = await procesarRespuesta(res);
  avisarCarritoActualizado();
  return datos;
}

export async function eliminarDelCarrito(token: string, productoId: number) {
  const res = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: "DELETE",
    headers: headersAuth(token),
  });
  if (!res.ok) throw new Error("No se pudo eliminar el producto del carrito");
  avisarCarritoActualizado();
}

export async function crearPreferenciaCheckout(token: string) {
  const res = await fetch(`${API_URL}/checkout/crear-preferencia`, {
    method: "POST",
    headers: headersAuth(token),
  });
  const datos = await procesarRespuesta(res);
  avisarCarritoActualizado();
  return datos;
}

export async function confirmarPagoCheckout(token: string, paymentId: string) {
  const res = await fetch(`${API_URL}/checkout/confirmar`, {
    method: "POST",
    headers: headersAuth(token),
    body: JSON.stringify({ paymentId }),
  });
  return procesarRespuesta(res);
}

export async function obtenerPedidos(token: string) {
  const res = await fetch(`${API_URL}/pedidos`, { headers: headersAuth(token) });
  return procesarRespuesta(res);
}

export async function obtenerPedido(token: string, id: string) {
  const res = await fetch(`${API_URL}/pedidos/${id}`, { headers: headersAuth(token) });
  return procesarRespuesta(res);
}
