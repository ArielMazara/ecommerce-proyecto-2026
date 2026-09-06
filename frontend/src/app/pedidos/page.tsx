"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { obtenerPedidos } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ESTADOS_PEDIDO } from "@/lib/estados-pedido";

type Pedido = {
  id: number;
  fecha: string;
  estado: keyof typeof ESTADOS_PEDIDO;
  total: string;
  items: { id: number; cantidad: number }[];
};

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date(fecha));
}

export default function PedidosPage() {
  const { usuario, token, cargando: cargandoAuth } = useAuth();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!usuario) {
      router.push("/login");
      return;
    }
    if (!token) return;
    obtenerPedidos(token)
      .then(setPedidos)
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoAuth, usuario]);

  if (cargandoAuth || cargando) {
    return <p className="px-8 py-12 sm:px-16 text-muted-foreground">Cargando pedidos...</p>;
  }

  return (
    <div className="min-h-screen px-8 py-12 sm:px-16">
      <h1 className="font-serif text-4xl text-foreground mb-8">Mis pedidos</h1>

      {pedidos.length === 0 ? (
        <div>
          <p className="text-muted-foreground mb-4">Todavía no hiciste ningún pedido.</p>
          <Link href="/" className="text-gold hover:underline">
            Ver el catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {pedidos.map((pedido) => {
            const estado = ESTADOS_PEDIDO[pedido.estado];
            const cantidadItems = pedido.items.reduce((acc, i) => acc + i.cantidad, 0);

            return (
              <Link
                key={pedido.id}
                href={`/pedidos/${pedido.id}`}
                className="flex items-center justify-between border border-border/60 rounded-lg p-4 hover:border-gold/40 transition-colors"
              >
                <div>
                  <p className="text-foreground">Pedido #{pedido.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatearFecha(pedido.fecha)} · {cantidadItems} {cantidadItems === 1 ? "botella" : "botellas"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={estado.clase}>
                    {estado.etiqueta}
                  </Badge>
                  <span className="font-serif text-lg text-gold">
                    {formatearPrecio(Number(pedido.total))}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
