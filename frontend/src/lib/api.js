const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function obtenerProductos(filtros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor);
  });

  const query = params.toString();
  const res = await fetch(`${API_URL}/productos${query ? `?${query}` : ""}`);

  if (!res.ok) throw new Error("No se pudieron cargar los productos");
  return res.json();
}

export async function obtenerProducto(id) {
  const res = await fetch(`${API_URL}/productos/${id}`);
  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
}

export async function crearProducto(token, datos) {
  const res = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: headersAuth(token),
    body: JSON.stringify(datos),
  });
  return procesarRespuesta(res);
}

export async function actualizarProducto(token, id, datos) {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: headersAuth(token),
    body: JSON.stringify(datos),
  });
  return procesarRespuesta(res);
}

export async function eliminarProducto(token, id) {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: "DELETE",
    headers: headersAuth(token),
  });
  if (!res.ok) {
    const datos = await res.json().catch(() => ({}));
    throw new Error(datos.error || "No se pudo eliminar el producto");
  }
}

async function procesarRespuesta(res) {
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(datos.error || "Ocurrió un error");
  return datos;
}

export async function registrarUsuario(datos) {
  const res = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return procesarRespuesta(res);
}

export async function iniciarSesion(datos) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return procesarRespuesta(res);
}

export async function solicitarRecuperacion(email) {
  const res = await fetch(`${API_URL}/auth/solicitar-recuperacion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return procesarRespuesta(res);
}

export async function resetearContrasena(token, contrasena) {
  const res = await fetch(`${API_URL}/auth/resetear-contrasena`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, contrasena }),
  });
  return procesarRespuesta(res);
}

function headersAuth(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const EVENTO_CARRITO_ACTUALIZADO = "carrito-actualizado";

function avisarCarritoActualizado() {
  window.dispatchEvent(new Event(EVENTO_CARRITO_ACTUALIZADO));
}

export async function obtenerCarrito(token) {
  const res = await fetch(`${API_URL}/carrito`, { headers: headersAuth(token) });
  return procesarRespuesta(res);
}

export async function agregarAlCarrito(token, productoId, cantidad = 1) {
  const res = await fetch(`${API_URL}/carrito`, {
    method: "POST",
    headers: headersAuth(token),
    body: JSON.stringify({ productoId, cantidad }),
  });
  const datos = await procesarRespuesta(res);
  avisarCarritoActualizado();
  return datos;
}

export async function actualizarCantidadCarrito(token, productoId, cantidad) {
  const res = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: "PUT",
    headers: headersAuth(token),
    body: JSON.stringify({ cantidad }),
  });
  const datos = await procesarRespuesta(res);
  avisarCarritoActualizado();
  return datos;
}

export async function eliminarDelCarrito(token, productoId) {
  const res = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: "DELETE",
    headers: headersAuth(token),
  });
  if (!res.ok) throw new Error("No se pudo eliminar el producto del carrito");
  avisarCarritoActualizado();
}

export async function crearPreferenciaCheckout(token) {
  const res = await fetch(`${API_URL}/checkout/crear-preferencia`, {
    method: "POST",
    headers: headersAuth(token),
  });
  const datos = await procesarRespuesta(res);
  avisarCarritoActualizado();
  return datos;
}

export async function reintentarPedido(token, pedidoId) {
  const res = await fetch(`${API_URL}/checkout/reintentar/${pedidoId}`, {
    method: "POST",
    headers: headersAuth(token),
  });
  return procesarRespuesta(res);
}

export async function confirmarPagoCheckout(token, paymentId) {
  const res = await fetch(`${API_URL}/checkout/confirmar`, {
    method: "POST",
    headers: headersAuth(token),
    body: JSON.stringify({ paymentId }),
  });
  return procesarRespuesta(res);
}

export async function obtenerPedidos(token) {
  const res = await fetch(`${API_URL}/pedidos`, { headers: headersAuth(token) });
  return procesarRespuesta(res);
}

export async function obtenerPedido(token, id) {
  const res = await fetch(`${API_URL}/pedidos/${id}`, { headers: headersAuth(token) });
  return procesarRespuesta(res);
}
