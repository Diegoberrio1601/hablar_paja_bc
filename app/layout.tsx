import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import Toaster from "@/components/Toaster";
import AnimatedBackground from "@/components/AnimatedBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hablarpajabc.vercel.app'),
  title: {
    default: "Hablar Paja BC | Club de Lectura",
    template: "%s | Hablar Paja BC"
  },
  description: "Un espacio para los que aman los libros, la paja y no tienen miedo de decir lo que piensan. Reseñas, recomendaciones y club de lectura.",
  keywords: ["libros", "reseñas", "club de lectura", "literatura", "hablar paja", "blog literario"],
  authors: [{ name: "Hablar Paja BC team" }],
  openGraph: {
    title: "Hablar Paja BC | Club de Lectura",
    description: "Un espacio para los que aman los libros, la paja y no tienen miedo de decir lo que piensan.",
    url: 'https://hablarpajabc.vercel.app',
    siteName: 'Hablar Paja BC',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // Necesitarás subir esta imagen o la generaremos
        width: 1200,
        height: 630,
        alt: 'Hablar Paja BC - Club de Lectura',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hablar Paja BC",
    description: "Reseñas de libros y club de lectura.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="relative min-h-screen">
              <AnimatedBackground />
              <div className="relative z-10">
                {children}
              </div>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
