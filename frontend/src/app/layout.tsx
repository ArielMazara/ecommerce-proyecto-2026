import type { Metadata } from "next";
import { Inter, Playfair_Display, Parisienne } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const parisienne = Parisienne({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Altos del Uco — Vinos de bodegas boutique",
  description: "Vinos de bodegas boutique del Valle de Uco, Mendoza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${playfair.variable} ${parisienne.variable} antialiased`}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
