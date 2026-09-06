"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { agregarAlCarrito } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function AgregarCarritoButton({ productoId, stock }) {
  const { usuario, token } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!usuario) {
    return (
      <Link href="/login">
        <Button variant="outline">Iniciá sesión para comprar</Button>
      </Link>
    );
  }

  async function agregar() {
    if (!token) return;
    setEnviando(true);
    setMensaje("");
    try {
      await agregarAlCarrito(token, productoId, 1);
      setMensaje("Agregado al carrito ✓");
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : "No se pudo agregar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <Button onClick={agregar} disabled={enviando || stock === 0}>
        {stock === 0 ? "Sin stock" : enviando ? "Agregando..." : "Agregar al carrito"}
      </Button>
      {mensaje && <p className="text-sm text-muted-foreground mt-2">{mensaje}</p>}
    </div>
  );
}
