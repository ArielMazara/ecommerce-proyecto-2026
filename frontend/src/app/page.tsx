import Link from "next/link";
import { Catalogo } from "@/components/catalogo";
import { Divider } from "@/components/divider";
import { BottleHero } from "@/components/bottle-hero";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="text-center px-8 pt-20 pb-8 sm:pt-28">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-5">
          Valle de Uco · Mendoza
        </p>
        <h1 className="font-serif text-5xl sm:text-7xl text-foreground leading-[1.05] text-balance">
          Vinos de <span className="text-gold">altura</span>.
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mt-5 text-balance">
          Bodegas boutique del Valle de Uco, seleccionadas por su carácter de terroir.
        </p>

        <div className="flex justify-center">
          <BottleHero className="h-[52vh] max-h-[560px] w-auto mt-4 sm:mt-8" />
        </div>

        <div className="flex items-center justify-center gap-8 -mt-2">
          <a
            href="#catalogo"
            className="rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Ver catálogo
          </a>
          <Link
            href="/registro"
            className="text-sm text-foreground/80 hover:text-gold transition-colors"
          >
            Crear cuenta →
          </Link>
        </div>
      </section>

      <main id="catalogo" className="px-8 py-24 sm:px-16 scroll-mt-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-foreground mb-4">Nuestra selección</h2>
          <Divider />
        </div>
        <Catalogo />
      </main>
    </div>
  );
}
