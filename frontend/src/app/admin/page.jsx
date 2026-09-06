"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SIN_IMAGEN = "__sin_imagen__";

const IMAGENES_DISPONIBLES = [
  { valor: SIN_IMAGEN, etiqueta: "Sin imagen (placeholder)" },
  { valor: "/productos/botella-tinta.jpg", etiqueta: "Botella tinta 1" },
  { valor: "/productos/botella-tinta-2.jpg", etiqueta: "Botella tinta 2" },
  { valor: "/productos/botella-tinta-3.jpg", etiqueta: "Botella tinta 3" },
  { valor: "/productos/botella-blanca-1.jpg", etiqueta: "Botella blanca 1" },
  { valor: "/productos/botella-blanca-2.jpg", etiqueta: "Botella blanca 2" },
];

const FORM_VACIO = {
  nombre: "",
  bodega: "",
  varietal: "",
  anada: "",
  region: "",
  precio: "",
  stock: "",
  descripcion: "",
  notasCata: "",
  maridaje: "",
  imagenUrl: "",
};

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(precio));
}

export default function AdminPage() {
  const { usuario, token, cargando: cargandoAuth } = useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null); // null = form cerrado, "nuevo" = alta, id = edición
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

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
    cargarProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoAuth, usuario]);

  function cargarProductos() {
    setCargando(true);
    obtenerProductos()
      .then(setProductos)
      .finally(() => setCargando(false));
  }

  function abrirAlta() {
    setForm(FORM_VACIO);
    setError("");
    setEditandoId("nuevo");
  }

  function abrirEdicion(producto) {
    setForm({
      nombre: producto.nombre,
      bodega: producto.bodega,
      varietal: producto.varietal,
      anada: String(producto.anada),
      region: producto.region,
      precio: String(producto.precio),
      stock: String(producto.stock),
      descripcion: producto.descripcion || "",
      notasCata: producto.notasCata || "",
      maridaje: producto.maridaje || "",
      imagenUrl: producto.imagenUrl || "",
    });
    setError("");
    setEditandoId(producto.id);
  }

  function cancelar() {
    setEditandoId(null);
    setError("");
  }

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setGuardando(true);
    try {
      if (editandoId === "nuevo") {
        await crearProducto(token, form);
      } else {
        await actualizarProducto(token, editandoId, form);
      }
      setEditandoId(null);
      cargarProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto");
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(producto) {
    if (!token) return;
    if (!confirm(`¿Borrar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
    setError("");
    try {
      await eliminarProducto(token, producto.id);
      cargarProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar el producto");
    }
  }

  if (cargandoAuth || !usuario || usuario.rol !== "ADMIN") {
    return <p className="px-8 py-12 sm:px-16 text-muted-foreground">Cargando...</p>;
  }

  return (
    <div className="min-h-screen px-8 py-12 sm:px-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl text-foreground">Administrar productos</h1>
        {editandoId === null && <Button onClick={abrirAlta}>Agregar producto</Button>}
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {editandoId !== null && (
        <form
          onSubmit={guardar}
          className="space-y-4 max-w-2xl border border-border/60 rounded-lg p-6 mb-10"
        >
          <h2 className="font-serif text-xl text-foreground mb-2">
            {editandoId === "nuevo" ? "Nuevo producto" : "Editar producto"}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              required
            />
            <Input
              placeholder="Bodega"
              value={form.bodega}
              onChange={(e) => actualizarCampo("bodega", e.target.value)}
              required
            />
            <Input
              placeholder="Varietal"
              value={form.varietal}
              onChange={(e) => actualizarCampo("varietal", e.target.value)}
              required
            />
            <Input
              placeholder="Región"
              value={form.region}
              onChange={(e) => actualizarCampo("region", e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Añada"
              value={form.anada}
              onChange={(e) => actualizarCampo("anada", e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={(e) => actualizarCampo("precio", e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => actualizarCampo("stock", e.target.value)}
              required
            />

            <Select
              value={form.imagenUrl || SIN_IMAGEN}
              onValueChange={(v) => actualizarCampo("imagenUrl", v === SIN_IMAGEN ? "" : v)}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Foto" /></SelectTrigger>
              <SelectContent>
                {IMAGENES_DISPONIBLES.map((img) => (
                  <SelectItem key={img.valor} value={img.valor}>
                    {img.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => actualizarCampo("descripcion", e.target.value)}
          />
          <Input
            placeholder="Notas de cata"
            value={form.notasCata}
            onChange={(e) => actualizarCampo("notasCata", e.target.value)}
          />
          <Input
            placeholder="Maridaje"
            value={form.maridaje}
            onChange={(e) => actualizarCampo("maridaje", e.target.value)}
          />

          <div className="flex gap-3">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
            <Button type="button" variant="ghost" onClick={cancelar}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {cargando ? (
        <p className="text-muted-foreground">Cargando productos...</p>
      ) : (
        <div className="space-y-3 max-w-4xl">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="flex items-center justify-between border border-border/60 rounded-lg p-4"
            >
              <div>
                <p className="text-foreground">{producto.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {producto.bodega} · {producto.varietal} · {producto.anada}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-muted-foreground">
                  Stock: <span className="text-foreground">{producto.stock}</span>
                </span>
                <span className="font-serif text-gold">{formatearPrecio(producto.precio)}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => abrirEdicion(producto)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => borrar(producto)}>
                    Borrar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
