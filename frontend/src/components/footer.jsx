import Link from "next/link";
import { Divider } from "@/components/divider";

export function Footer() {
  return (
    <footer className="border-t border-border/60 px-8 py-12 sm:px-16 mt-24">
      <div className="max-w-5xl mx-auto">
        <Divider />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
          <div className="text-center sm:text-left">
            <p className="font-serif text-xl text-foreground">Altos del Uco</p>
            <p className="text-sm text-muted-foreground mt-1">
              Vinos de bodegas boutique del Valle de Uco, Mendoza.
            </p>
          </div>

          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-gold transition-colors">
              Catálogo
            </Link>
            <Link href="/carrito" className="hover:text-gold transition-colors">
              Carrito
            </Link>
            <Link href="/pedidos" className="hover:text-gold transition-colors">
              Mis pedidos
            </Link>
          </nav>
        </div>

        <p className="text-center text-xs text-muted-foreground/70 mt-10">
          Beber con moderación. Venta exclusiva para mayores de 18 años.
        </p>
      </div>
    </footer>
  );
}
