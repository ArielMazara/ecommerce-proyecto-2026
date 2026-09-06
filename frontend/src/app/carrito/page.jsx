"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  obtenerCarrito,
  actualizarCantidadCarrito,
  eliminarDelCarrito,
  crearPreferenciaCheckout,
} from "@/lib/api";
import { Button } from "@/components/ui/button";

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
}

export default function CarritoPage() {
  const { usuario, token, cargando: cargandoAuth } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!usuario) {
      router.push("/login");
      return;
    }
    cargarCarrito();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoAuth, usuario]);

  function cargarCarrito() {
    if (!token) return;
    setCargando(true);
    obtenerCarrito(token)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .finally(() => setCargando(false));
  }

  async function cambiarCantidad(productoId, cantidad) {
    if (!token || cantidad < 1) return;
    setError("");
    try {
      await actualizarCantidadCarrito(token, productoId, cantidad);
      cargarCarrito();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la cantidad");
    }
  }

  async function quitar(productoId) {
    if (!token) return;
    await eliminarDelCarrito(token, productoId);
    cargarCarrito();
  }

  async function irAPagar() {
    if (!token) return;
    setError("");
    setProcesandoPago(true);
    try {
      const { initPoint } = await crearPreferenciaCheckout(token);
      window.location.href = initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
      setProcesandoPago(false);
    }
  }

  if (cargandoAuth || cargando) {
    return <p className="px-8 py-12 sm:px-16 text-muted-foreground">Cargando carrito...</p>;
  }

  return (
    <div className="min-h-screen px-8 py-12 sm:px-16">
      <h1 className="font-serif text-4xl text-foreground mb-8">Mi carrito</h1>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {items.length === 0 ? (
        <div>
          <p className="text-muted-foreground mb-4">Tu carrito está vacío.</p>
          <Link href="/" className="text-gold hover:underline">
            Ver el catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border border-border/60 rounded-lg p-4"
            >
              <div className="relative w-16 h-28 shrink-0 overflow-hidden rounded">
                <Image
                  src={item.producto.imagenUrl || "/productos/placeholder.svg"}
                  alt={item.producto.nombre}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              <div className="flex-1">
                <h2 className="font-serif text-lg text-foreground">{item.producto.nombre}</h2>
                <p className="text-sm text-muted-foreground">{item.producto.bodega}</p>
                <p className="text-gold mt-1">{formatearPrecio(Number(item.producto.precio))}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => cambiarCantidad(item.producto.id, item.cantidad - 1)}
                  disabled={item.cantidad <= 1}
                >
                  −
                </Button>
                <span className="w-6 text-center">{item.cantidad}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => cambiarCantidad(item.producto.id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.producto.stock}
                >
                  +
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={() => quitar(item.producto.id)}>
                Quitar
              </Button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-6 border-t border-border/60 max-w-2xl">
            <span className="text-lg text-foreground">Total</span>
            <span className="font-serif text-2xl text-gold">{formatearPrecio(total)}</span>
          </div>

          <Button className="w-full max-w-2xl" onClick={irAPagar} disabled={procesandoPago}>
            {procesandoPago ? "Redirigiendo a Mercado Pago..." : "Finalizar compra"}
          </Button>
        </div>
      )}
    </div>
  );
}
