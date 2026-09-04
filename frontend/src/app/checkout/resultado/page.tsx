"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { confirmarPagoCheckout } from "@/lib/api";

type Resultado = "cargando" | "aprobado" | "pendiente" | "rechazado" | "error";

const MENSAJES: Record<Resultado, { titulo: string; descripcion: string }> = {
  cargando: { titulo: "Confirmando el pago...", descripcion: "Un momento, por favor." },
  aprobado: {
    titulo: "¡Gracias por tu compra!",
    descripcion: "Tu pago fue aprobado y el pedido está en preparación.",
  },
  pendiente: {
    titulo: "Pago pendiente",
    descripcion: "Tu pago está siendo procesado. Te avisaremos cuando se confirme.",
  },
  rechazado: {
    titulo: "El pago no pudo procesarse",
    descripcion: "Podés volver al carrito e intentar de nuevo con otro medio de pago.",
  },
  error: {
    titulo: "No pudimos confirmar el pago",
    descripcion: "Si el dinero fue debitado, contactanos con el número de operación.",
  },
};

function ResultadoContenido() {
  const searchParams = useSearchParams();
  const { token, cargando: cargandoAuth } = useAuth();
  const [resultado, setResultado] = useState<Resultado>("cargando");

  useEffect(() => {
    if (cargandoAuth) return;

    const paymentId = searchParams.get("payment_id");
    const status = searchParams.get("status") || searchParams.get("collection_status");

    if (!token || !paymentId) {
      setResultado("error");
      return;
    }

    confirmarPagoCheckout(token, paymentId)
      .then(({ estado }) => {
        if (estado === "PAGADO") setResultado("aprobado");
        else if (status === "in_process" || status === "pending") setResultado("pendiente");
        else if (estado === "CANCELADO") setResultado("rechazado");
        else setResultado("pendiente");
      })
      .catch(() => setResultado("error"));
  }, [token, cargandoAuth, searchParams]);

  const { titulo, descripcion } = MENSAJES[resultado];

  return (
    <div className="min-h-screen flex items-center justify-center px-8 text-center">
      <div className="max-w-md">
        <h1 className="font-serif text-3xl text-foreground mb-4">{titulo}</h1>
        <p className="text-muted-foreground mb-8">{descripcion}</p>
        <Link href="/" className="text-gold hover:underline">
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}

export default function ResultadoCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <ResultadoContenido />
    </Suspense>
  );
}
