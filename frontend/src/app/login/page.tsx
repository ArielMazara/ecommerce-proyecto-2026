"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await login(email, contrasena);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-foreground mb-8 text-center">Iniciar sesión</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-gold hover:underline">
            Creá una
          </Link>
        </p>
      </div>
    </div>
  );
}
