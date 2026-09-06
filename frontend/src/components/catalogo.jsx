"use client";

import { useEffect, useState } from "react";
import { obtenerProductos } from "@/lib/api";
import { ProductoCard } from "@/components/producto-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TODOS = "__todos__";

const filtrosVacios = {
  varietal: "",
  bodega: "",
  anada: "",
  precioMin: "",
  precioMax: "",
};

export function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [opciones, setOpciones] = useState({
    varietales: [],
    bodegas: [],
    anadas: [],
  });
  const [filtros, setFiltros] = useState(filtrosVacios);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerProductos().then((todos) => {
      setOpciones({
        varietales: [...new Set(todos.map((p) => p.varietal))].sort(),
        bodegas: [...new Set(todos.map((p) => p.bodega))].sort(),
        anadas: [...new Set(todos.map((p) => p.anada))].sort((a, b) => b - a),
      });
    });
  }, []);

  useEffect(() => {
    setCargando(true);
    obtenerProductos(filtros)
      .then(setProductos)
      .finally(() => setCargando(false));
  }, [filtros]);

  function actualizar(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor === TODOS ? "" : valor }));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-10 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Varietal</label>
          <Select value={filtros.varietal || TODOS} onValueChange={(v) => actualizar("varietal", v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              {opciones.varietales.map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Bodega</label>
          <Select value={filtros.bodega || TODOS} onValueChange={(v) => actualizar("bodega", v)}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas</SelectItem>
              {opciones.bodegas.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Añada</label>
          <Select value={filtros.anada || TODOS} onValueChange={(v) => actualizar("anada", v)}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas</SelectItem>
              {opciones.anadas.map((a) => (
                <SelectItem key={a} value={String(a)}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Precio mín.</label>
          <Input
            type="number"
            className="w-28"
            value={filtros.precioMin}
            onChange={(e) => actualizar("precioMin", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Precio máx.</label>
          <Input
            type="number"
            className="w-28"
            value={filtros.precioMax}
            onChange={(e) => actualizar("precioMax", e.target.value)}
          />
        </div>

        <Button variant="ghost" onClick={() => setFiltros(filtrosVacios)}>
          Limpiar filtros
        </Button>
      </div>

      {cargando ? (
        <p className="text-muted-foreground">Cargando vinos...</p>
      ) : productos.length === 0 ? (
        <p className="text-muted-foreground">No encontramos vinos con esos filtros.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
