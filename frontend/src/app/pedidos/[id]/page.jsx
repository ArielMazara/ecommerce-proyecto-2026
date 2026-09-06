"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { obtenerPedido, reintentarPedido } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ESTADOS_PEDIDO } from "@/lib/estados-pedido";

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
}

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(fecha)
  );
}

export default function DetallePedidoPage() {
  const { id } = useParams();
  const { usuario, token, cargando: cargandoAuth } = useAuth();
  const router = useRouter();
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState("");
  const [reintentando, setReintentando] = useState(false);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!usuario) {
      router.push("/login");
      return;
    }
    if (!token) return;
    obtenerPedido(token, id)
      .then(setPedido)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el pedido"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoAuth, usuario, id]);

  async function volverAComprar() {
    if (!token || !pedido) return;
    setError("");
    setReintentando(true);
    try {
      const { initPoint } = await reintentarPedido(token, pedido.id);
      window.location.href = initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
      setReintentando(false);
    }
  }

  if (cargandoAuth || (!pedido && !error)) {
    return <p className="px-8 py-12 sm:px-16 text-muted-foreground">Cargando pedido...</p>;
  }

  if (error || !pedido) {
    return (
      <div className="px-8 py-12 sm:px-16">
        <p className="text-destructive mb-4">{error}</p>
        <Link href="/pedidos" className="text-gold hover:underline">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const estado = ESTADOS_PEDIDO[pedido.estado];
  const sePuedeReintentar = pedido.estado === "PENDIENTE" || pedido.estado === "CANCELADO";

  return (
    <div className="min-h-screen px-8 py-12 sm:px-16">
      <Link href="/pedidos" className="text-sm text-muted-foreground hover:text-gold transition-colors">
        ← Volver a mis pedidos
      </Link>

      <div className="mt-8 mb-8 flex items-center justify-between max-w-2xl">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Pedido #{pedido.id}</h1>
          <p className="text-sm text-muted-foreground mt-1">{formatearFecha(pedido.fecha)}</p>
        </div>
        <Badge variant="outline" className={estado.clase}>
          {estado.etiqueta}
        </Badge>
      </div>

      {error && <p className="text-sm text-destructive mb-4 max-w-2xl">{error}</p>}

      <div className="space-y-4 max-w-2xl">
        {pedido.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border border-border/60 rounded-lg p-4">
            <div className="relative w-14 h-24 shrink-0 overflow-hidden rounded">
              <Image
                src={item.producto.imagenUrl || "/productos/placeholder.svg"}
                alt={item.producto.nombre}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>

            <div className="flex-1">
              <h2 className="font-serif text-lg text-foreground">{item.producto.nombre}</h2>
              <p className="text-sm text-muted-foreground">{item.producto.bodega}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {item.cantidad} × {formatearPrecio(Number(item.precioUnitario))}
              </p>
            </div>

            <span className="text-gold">
              {formatearPrecio(item.cantidad * Number(item.precioUnitario))}
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between pt-6 border-t border-border/60">
          <span className="text-lg text-foreground">Total</span>
          <span className="font-serif text-2xl text-gold">{formatearPrecio(Number(pedido.total))}</span>
        </div>

        <div className="border-t border-border/60 pt-6">
          <h2 className="text-xs uppercase tracking-wider text-gold mb-2">Dirección de envío</h2>
          <p className="text-sm text-muted-foreground">
            {pedido.direccionCalle}, {pedido.direccionCiudad}, {pedido.direccionProvincia} (CP {pedido.direccionCodigoPostal})
          </p>
        </div>

        {pedido.estado === "ENVIADO" && (
          <div className="border-t border-border/60 pt-6">
            <h2 className="text-xs uppercase tracking-wider text-gold mb-2">Seguimiento del envío</h2>
            <p className="text-sm text-muted-foreground">
              {pedido.transportista} · {pedido.numeroSeguimiento}
            </p>
          </div>
        )}

        {sePuedeReintentar && (
          <Button className="w-full" onClick={volverAComprar} disabled={reintentando}>
            {reintentando ? "Redirigiendo a Mercado Pago..." : "Volver a comprar"}
          </Button>
        )}
      </div>
    </div>
  );
}
