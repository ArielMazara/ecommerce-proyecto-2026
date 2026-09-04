import { Catalogo } from "@/components/catalogo";
import { Divider } from "@/components/divider";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section
        className="relative overflow-hidden px-8 py-24 sm:px-16 sm:py-32 text-center"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklch, var(--primary) 35%, transparent), transparent), repeating-linear-gradient(115deg, transparent, transparent 42px, color-mix(in oklch, var(--gold) 5%, transparent) 42px, color-mix(in oklch, var(--gold) 5%, transparent) 43px)",
        }}
      >
        <p className="text-gold uppercase tracking-[0.35em] text-xs mb-6">
          Valle de Uco, Mendoza
        </p>
        <h1 className="font-serif text-5xl sm:text-7xl text-foreground leading-tight text-balance">
          Vinos de altura,
          <br />
          <span className="italic text-gold">con carácter de terroir</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto mt-6 text-balance">
          Una selección curada de bodegas boutique del Valle de Uco — pequeñas
          producciones, identidad de altura y el sello de cada terroir.
        </p>

        <a
          href="#catalogo"
          className="inline-block mt-10 border border-gold/50 text-gold px-8 py-3 text-sm uppercase tracking-widest hover:bg-gold hover:text-background transition-colors"
        >
          Ver la colección
        </a>
      </section>

      <main id="catalogo" className="px-8 py-20 sm:px-16 scroll-mt-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-foreground mb-4">Nuestra selección</h2>
          <Divider />
        </div>
        <Catalogo />
      </main>
    </div>
  );
}
