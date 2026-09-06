"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetearContrasena } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth-layout";

export default function ResetearContrasenaPage() {
  const { token } = useParams();
  const router = useRouter();
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setEnviando(true);
    try {
      await resetearContrasena(token, contrasena);
      setListo(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Casi listo"
      tagline="Elegí una contraseña nueva para volver a entrar."
    >
      <h1 className="font-serif text-3xl text-foreground mb-8 text-center">Nueva contraseña</h1>

      {listo ? (
        <p className="text-sm text-muted-foreground text-center">
          Contraseña actualizada. Te llevamos a iniciar sesión...
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
      )}

      <p className="text-sm text-muted-foreground text-center mt-6">
        <Link href="/login" className="text-gold hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
