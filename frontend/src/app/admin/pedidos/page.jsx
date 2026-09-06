"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { obtenerPedidosAdmin, marcarPedidoEnviado } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ESTADOS_PEDIDO } from "@/lib/estados-pedido";

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(precio));
}

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date(fecha));
}

function FormularioEnvio({ pedido, token, onGuardado }) {
  const [transportista, setTransportista] = useState(pedido.transportista || "");
  const [numeroSeguimiento, setNumeroSeguimiento] = useState(pedido.numeroSeguimiento || "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await marcarPedidoEnviado(token, pedido.id, { transportista, numeroSeguimiento });
      onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo marcar como enviado");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="flex flex-wrap items-end gap-2 mt-3">
      <Input
        placeholder="Transportista"
        value={transportista}
        onChange={(e) => setTransportista(e.target.value)}
        className="w-40"
        required
      />
      <Input
        placeholder="N° de seguimiento"
        value={numeroSeguimiento}
        onChange={(e) => setNumeroSeguimiento(e.target.value)}
        className="w-44"
        required
      />
      <Button type="submit" size="sm" disabled={guardando}>
        {guardando
          ? "Guardando..."
          : pedido.estado === "ENVIADO"
          ? "Actualizar seguimiento"
          : "Marcar como enviado"}
      </Button>
      {error && <p className="text-sm text-destructive w-full">{error}</p>}
    </form>
  );
}

export default function AdminPedidosPage() {
  const { usuario, token, cargando: cargandoAuth } = useAuth();
  const router = useRouter();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoEnvioId, setEditandoEnvioId] = useState(null);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!usuario) {
      router.push("/login");
      return;
    }
    if (usuario.rol !== "ADMIN") {
      router.push("/");
      return;
    }
    cargarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoAuth, usuario]);

  function cargarPedidos() {
    setCargando(true);
    obtenerPedidosAdmin(token)
      .then(setPedidos)
      .finally(() => setCargando(false));
  }

  if (cargandoAuth || !usuario || usuario.rol !== "ADMIN") {
    return <p className="px-8 py-12 sm:px-16 text-muted-foreground">Cargando...</p>;
  }

  return (
    <div className="min-h-screen px-8 py-12 sm:px-16">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-4xl text-foreground">Pedidos y envíos</h1>
      </div>
      <Link href="/admin" className="text-sm text-muted-foreground hover:text-gold transition-colors">
        ← Administrar productos
      </Link>

      {cargando ? (
        <p className="text-muted-foreground mt-8">Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p className="text-muted-foreground mt-8">Todavía no hay pedidos.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mt-8">
          {pedidos.map((pedido) => {
            const estado = ESTADOS_PEDIDO[pedido.estado];

            return (
              <div key={pedido.id} className="border border-border/60 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground">
                      Pedido #{pedido.id} — {pedido.usuario.nombre} ({pedido.usuario.email})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatearFecha(pedido.fecha)} ·{" "}
                      {pedido.items.reduce((acc, i) => acc + i.cantidad, 0)} botellas ·{" "}
                      {formatearPrecio(pedido.total)}
                    </p>
                  </div>
                  <Badge variant="outline" className={estado.clase}>
                    {estado.etiqueta}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mt-3">
                  {pedido.direccionCalle}, {pedido.direccionCiudad}, {pedido.direccionProvincia} (CP{" "}
                  {pedido.direccionCodigoPostal})
                </p>

                {pedido.estado === "ENVIADO" && editandoEnvioId !== pedido.id && (
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm text-muted-foreground">
                      Enviado por <span className="text-foreground">{pedido.transportista}</span> · seguimiento{" "}
                      <span className="text-foreground">{pedido.numeroSeguimiento}</span>
                    </p>
                    <Button size="sm" variant="ghost" onClick={() => setEditandoEnvioId(pedido.id)}>
                      Editar
                    </Button>
                  </div>
                )}

                {pedido.estado === "PAGADO" && (
                  <FormularioEnvio
                    pedido={pedido}
                    token={token}
                    onGuardado={() => {
                      setEditandoEnvioId(null);
                      cargarPedidos();
                    }}
                  />
                )}

                {pedido.estado === "ENVIADO" && editandoEnvioId === pedido.id && (
                  <FormularioEnvio
                    pedido={pedido}
                    token={token}
                    onGuardado={() => {
                      setEditandoEnvioId(null);
                      cargarPedidos();
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
