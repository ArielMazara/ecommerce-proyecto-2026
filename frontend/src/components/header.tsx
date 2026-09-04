"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { obtenerCarrito, EVENTO_CARRITO_ACTUALIZADO } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function Header() {
  const { usuario, token, logout } = useAuth();
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  useEffect(() => {
    if (!token) {
      setCantidadCarrito(0);
      return;
    }

    function actualizarContador() {
      obtenerCarrito(token!)
        .then(({ items }) => setCantidadCarrito(items.reduce((acc: number, i: { cantidad: number }) => acc + i.cantidad, 0)))
        .catch(() => setCantidadCarrito(0));
    }

    actualizarContador();
    window.addEventListener(EVENTO_CARRITO_ACTUALIZADO, actualizarContador);
    return () => window.removeEventListener(EVENTO_CARRITO_ACTUALIZADO, actualizarContador);
  }, [token]);

  return (
    <header className="flex items-center justify-between px-8 py-4 sm:px-16 border-b border-border/60">
      <Link href="/" className="font-serif text-xl text-foreground">
        Altos del Uco
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <Link href="/carrito" className="text-muted-foreground hover:text-gold transition-colors">
          Carrito{cantidadCarrito > 0 ? ` (${cantidadCarrito})` : ""}
        </Link>

        {usuario ? (
          <>
            <Link href="/pedidos" className="text-muted-foreground hover:text-gold transition-colors">
              Mis pedidos
            </Link>
            <span className="text-muted-foreground">Hola, {usuario.nombre.split(" ")[0]}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Cerrar sesión
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">
              Iniciar sesión
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
