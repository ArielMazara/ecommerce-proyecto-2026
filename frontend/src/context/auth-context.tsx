"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { iniciarSesion, registrarUsuario } from "@/lib/api";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
};

type AuthContextType = {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  registro: (datos: {
    nombre: string;
    email: string;
    contrasena: string;
    fechaNacimiento: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const guardado = localStorage.getItem("auth");
    if (guardado) {
      const { usuario, token } = JSON.parse(guardado);
      setUsuario(usuario);
      setToken(token);
    }
    setCargando(false);
  }, []);

  function guardarSesion(usuario: Usuario, token: string) {
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem("auth", JSON.stringify({ usuario, token }));
  }

  async function login(email: string, contrasena: string) {
    const { usuario, token } = await iniciarSesion({ email, contrasena });
    guardarSesion(usuario, token);
  }

  async function registro(datos: {
    nombre: string;
    email: string;
    contrasena: string;
    fechaNacimiento: string;
  }) {
    const { usuario, token } = await registrarUsuario(datos);
    guardarSesion(usuario, token);
  }

  function logout() {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("auth");
  }

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
