import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerProducto } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { AgregarCarritoButton } from "@/components/agregar-carrito-button";

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(precio));
}

export default async function FichaProducto({ params }) {
  const { id } = await params;

  let producto;
  try {
    producto = await obtenerProducto(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen px-8 py-12 sm:px-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-gold transition-colors">
        ← Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-12 mt-8">
        <div className="relative aspect-[1/2] w-full max-w-md mx-auto overflow-hidden rounded-lg border border-border/60">
          <Image
            src={producto.imagenUrl || "/productos/placeholder.svg"}
            alt={`Botella de ${producto.nombre}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div>
          <Badge
            variant="outline"
            className="mb-4 border-gold/40 text-gold uppercase tracking-wider text-[10px]"
          >
            {producto.varietal} · {producto.anada}
          </Badge>

          <h1 className="font-serif text-4xl text-foreground mb-2">{producto.nombre}</h1>
          <p className="text-muted-foreground mb-6">
            {producto.bodega} — {producto.region}
          </p>

          <p className="font-serif text-3xl text-gold mb-6">
            {formatearPrecio(producto.precio)}
          </p>

          <div className="mb-6">
            <AgregarCarritoButton productoId={producto.id} stock={producto.stock} />
          </div>

          {producto.descripcion && (
            <p className="text-foreground/90 leading-relaxed mb-8">{producto.descripcion}</p>
          )}

          <div className="space-y-6 border-t border-border/60 pt-6">
            {producto.notasCata && (
              <div>
                <h2 className="text-xs uppercase tracking-wider text-gold mb-2">Notas de cata</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{producto.notasCata}</p>
              </div>
            )}

            {producto.maridaje && (
              <div>
                <h2 className="text-xs uppercase tracking-wider text-gold mb-2">Maridaje</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{producto.maridaje}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            {producto.stock > 0 ? `${producto.stock} unidades disponibles` : "Sin stock por el momento"}
          </p>
        </div>
      </div>
    </div>
  );
}
