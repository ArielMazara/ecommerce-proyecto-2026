"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { iniciarSesion, registrarUsuario } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
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

  function guardarSesion(usuario, token) {
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem("auth", JSON.stringify({ usuario, token }));
  }

  async function login(email, contrasena) {
    const { usuario, token } = await iniciarSesion({ email, contrasena });
    guardarSesion(usuario, token);
  }

  async function registro(datos) {
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
