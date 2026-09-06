"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth-layout";

export default function RegistroPage() {
  const { registro } = useAuth();
  const router = useRouter();
  const [datos, setDatos] = useState({ nombre: "", email: "", contrasena: "", fechaNacimiento: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await registro(datos);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Sumate a la cosecha"
      tagline="Creá tu cuenta y descubrí bodegas boutique del Valle de Uco."
    >
      <h1 className="font-serif text-3xl text-foreground mb-2 text-center">Crear cuenta</h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Debés ser mayor de 18 años para registrarte.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          placeholder="Nombre"
          value={datos.nombre}
          onChange={(e) => actualizar("nombre", e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={datos.email}
          onChange={(e) => actualizar("email", e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={datos.contrasena}
          onChange={(e) => actualizar("contrasena", e.target.value)}
          required
        />
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Fecha de nacimiento
          </label>
          <Input
            type="date"
            value={datos.fechaNacimiento}
            onChange={(e) => actualizar("fechaNacimiento", e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
