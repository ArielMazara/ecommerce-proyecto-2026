"use client";

import { useState } from "react";
import Link from "next/link";
import { solicitarRecuperacion } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth-layout";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await solicitarRecuperacion(email);
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el email");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="¿Te olvidaste?"
      tagline="Te ayudamos a volver a entrar a tu cuenta."
    >
      <h1 className="font-serif text-3xl text-foreground mb-2 text-center">Recuperar contraseña</h1>

      {enviado ? (
        <p className="text-sm text-muted-foreground text-center mt-6">
          Si el email existe, te enviamos un link para restablecer tu contraseña. Revisá tu bandeja de entrada (y la carpeta de spam).
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Ingresá tu email y te mandamos un link para crear una nueva contraseña.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
        </>
      )}

      <p className="text-sm text-muted-foreground text-center mt-6">
        <Link href="/login" className="text-gold hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
