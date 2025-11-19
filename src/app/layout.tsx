import type { Metadata } from "next";
import { Inter, Poppins, Manrope } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { NoiseOverlay } from "@/components/noise-overlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "SouzaDev · Portfólio",
  description:
    "SouzaDev — Especialista em experiências digitais que convertem. Websites, e-commerces e produtos com tecnologia de ponta.",
  metadataBase: new URL("https://souzadev.com"),
  openGraph: {
    title: "SouzaDev · Experiências digitais imersivas",
    description:
      "Autoridade técnica, design moderno e performance em um único stack.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${poppins.variable} ${manrope.variable} bg-primary text-neutral-50 antialiased`}
      >
        <LenisProvider>
          <NoiseOverlay />
        {children}
        </LenisProvider>
      </body>
    </html>
  );
}
