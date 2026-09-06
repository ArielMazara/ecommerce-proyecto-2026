import Image from "next/image";

export function AuthLayout({
  eyebrow,
  tagline,
  children,
}: {
  eyebrow: string;
  tagline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="/hero/valle-de-uco-andes.jpg"
          alt="Viñedos del Valle de Uco con la Cordillera de los Andes de fondo"
          fill
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-background/40" />
        <div className="absolute inset-0 flex items-end p-12">
          <div>
            <p className="font-script text-4xl text-gold mb-2">{eyebrow}</p>
            <p className="font-serif text-2xl text-white max-w-sm text-balance">{tagline}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
