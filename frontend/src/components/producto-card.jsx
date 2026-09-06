"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  TextureCard,
  TextureCardContent,
  TextureCardFooter,
  TextureSeparator,
} from "@/components/ui/texture-card";
import { Badge } from "@/components/ui/badge";

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(precio));
}

export function ProductoCard({ producto }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/productos/${producto.id}`}>
        <TextureCard className="overflow-hidden h-full">
          <div className="relative aspect-[1/2] w-full overflow-hidden">
            <Image
              src={producto.imagenUrl || "/productos/placeholder.svg"}
              alt={`Botella de ${producto.nombre}`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          <TextureSeparator />

          <TextureCardContent>
            <Badge
              variant="outline"
              className="mb-2 border-gold/40 text-gold uppercase tracking-wider text-[10px]"
            >
              {producto.varietal} · {producto.anada}
            </Badge>
            <h3 className="font-serif text-xl text-foreground leading-snug">
              {producto.nombre}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {producto.bodega} — {producto.region}
            </p>
          </TextureCardContent>

          <TextureCardFooter>
            <span className="font-serif text-lg text-gold">
              {formatearPrecio(producto.precio)}
            </span>
            <span className="text-xs text-muted-foreground">
              {producto.stock > 0 ? "En stock" : "Sin stock"}
            </span>
          </TextureCardFooter>
        </TextureCard>
      </Link>
    </motion.div>
  );
}
