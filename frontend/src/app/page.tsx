import { Catalogo } from "@/components/catalogo";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 px-8 py-16 sm:px-16 text-center">
        <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4">
          Valle de Uco, Mendoza
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl text-foreground mb-4">
          Altos del Uco
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Una selección de vinos de bodegas boutique de altura, elegidos por su
          carácter e identidad de terroir.
        </p>
      </header>

      <main className="px-8 py-12 sm:px-16">
        <Catalogo />
      </main>
    </div>
  );
}
