"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Play 
} from "lucide-react";

const BrandIcons = {
  YouTube: ({ size = 24 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  Spotify: ({ size = 24 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.218.358-.686.469-1.042.247-2.848-1.741-6.433-2.134-10.655-1.17-.407.094-.816-.16-.91-.567-.094-.408.16-.816.567-.91 4.622-1.056 8.583-.605 11.793 1.358.356.222.469.69.247 1.042zm1.467-3.258c-.273.447-.852.593-1.297.318-3.262-2.003-8.23-2.585-12.083-1.415-.504.152-1.037-.132-1.189-.636-.153-.504.133-1.037.636-1.189 4.412-1.339 9.894-.687 13.616 1.597.447.275.592.852.317 1.295v.03zm.127-3.39c-3.914-2.324-10.366-2.54-14.136-1.393-.598.182-1.238-.156-1.419-.754-.18-.598.157-1.238.754-1.419 4.316-1.31 11.436-1.054 15.947 1.623.535.318.711 1.01.393 1.545-.318.535-1.01.711-1.545.393l.006.001z"/>
    </svg>
  ),
  Instagram: ({ size = 24 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  TikTok: ({ size = 24 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1 .05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
};

export default function ClubPage() {
  return (
    <main className="min-h-screen text-foreground relative overflow-hidden">
      <Navbar />

      {/* Hero Section - Simplified */}
      <section className="pt-40 pb-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="text-accent text-xs font-bold uppercase tracking-[0.3em] block">
            MANIFIESTO
          </span>
          <h1 className="text-5xl md:text-8xl font-bold serif leading-tight">
            Nuestra palabra <br />
            es el <span className="text-accent italic">vínculo</span>
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl font-light max-w-2xl mx-auto">
            En Hablar Paja BC no leemos para contar páginas.{" "}
            <span className="text-foreground font-medium">
              Leemos para que las páginas nos aprieten la cabeza.
            </span>
          </p>
        </div>
      </section>

      {/* Staggered Intro & Women Focus */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold serif">
              Un espacio sin poses
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Donde los libros son solo el comienzo y la conversación puede ir
              tan lejos como quieran l@s pajer@s.
            </p>
          </div>
          <div className="p-8 bg-accent/10 border border-accent/20 rounded-[2.5rem] relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-accent" /> Más ruido, más ojos
            </h3>
            <p className="text-foreground/80 italic leading-relaxed">
              Damos más voz a las mujeres en la literatura. Muchas han escrito
              historias potentes que merecen más lectores y más ruido.
            </p>
          </div>
        </div>
      </section>


      {/* Dynamics Section - Visual Cards */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold serif">
              ¿Cómo fluyen las pajitas grupales?
            </h2>
            <p className="text-accent font-bold uppercase tracking-[0.2em] text-sm">
              4 ENCUENTROS AL MES
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 bg-muted/5 border border-border rounded-[2.5rem] space-y-4 hover:border-accent/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform text-2xl">
                  🌐
                </div>
                <h3 className="text-xl font-bold serif">3 Pajitas Virtuales</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Cómodo desde casa para dejar que las ideas fluyan libremente.
                </p>
              </div>
              <div className="p-8 bg-muted/5 border border-border rounded-[2.5rem] space-y-4 hover:border-accent/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform text-2xl">
                  📍
                </div>
                <h3 className="text-xl font-bold serif">1 Pajita Presencial</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Vernos las caras hace que la conversación sea mucho más
                  intensa.
                </p>
              </div>
            </div>

            <div className="p-8 bg-accent/5 border border-accent/20 rounded-[2.5rem] space-y-4 flex flex-col justify-center text-center">
              <div className="text-4xl">📚</div>
              <h3 className="text-xl font-bold serif">Libros a la mano</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Si no tienes el libro, no te preocupes. Entre pajer@s siempre
                aparece una copia.
              </p>
            </div>
          </div>

          {/* Social Invitation - Compact & Iconic */}
          <div className="mt-16 p-10 bg-muted/10 border border-border rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold serif font-medium">
                Síguenos en nuestra aventura
              </h3>
              <p className="text-muted-foreground">
                Las pajitas buenas merecen ser compartidas.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-10">
              {[
                {
                  name: "YouTube",
                  url: "https://www.youtube.com/@hablarpajabc05",
                  icon: <BrandIcons.YouTube size={52} />,
                  color: "hover:text-[#FF0000]",
                },
                {
                  name: "Spotify",
                  url: "https://open.spotify.com/show/6LmAr5N4dbJst2AoZamjKQ?si=b2624cca2285419e",
                  icon: <BrandIcons.Spotify size={52} />,
                  color: "hover:text-[#1DB954]",
                },
                {
                  name: "Instagram",
                  url: "https://www.instagram.com/hablarpajabc/",
                  icon: <BrandIcons.Instagram size={52} />,
                  color: "hover:text-[#E4405F]",
                },
                {
                  name: "TikTok",
                  url: "https://www.tiktok.com/@hablarpajabc",
                  icon: <BrandIcons.TikTok size={52} />,
                  color: "hover:text-accent",
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  className={`transition-all hover:scale-125 hover:-translate-y-2 ${social.color} text-foreground/80`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Grid - "Lectura sin pena" (Moved down) */}
      <section className="py-24 px-6 bg-muted/5 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold serif mb-4">Lectura sin pena</h2>
            <p className="text-muted-foreground">
              Aquí nadie viene a aparentar. Lo único que pedimos es ganas de
              paja literaria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title: "No terminar el libro",
                desc: "Si no te atrapó, suéltalo sin remordimientos.",
                icon: "📖",
              },
              {
                title: "Amar u Odiar",
                desc: "Siente a los personajes como quieras.",
                icon: "🔥",
              },
              {
                title: "Cambiar de opinión",
                desc: "Se vale cambiar a mitad de la pajita.",
                icon: "🔄",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-8 bg-background border border-border rounded-[2.5rem] hover:border-accent/40 transition-all text-center space-y-4 group hover:shadow-xl"
              >
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{item.icon}</div>
                <h4 className="font-bold serif text-xl">{item.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Member CTA - Focused */}
      <section className="py-24 px-6 text-center relative overflow-hidden mx-6 rounded-[4rem] mb-24 lg:mx-20 bg-muted/10 border border-border group overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-accent/10 transition-all duration-700" />

        <div className="max-w-2xl mx-auto space-y-10 relative z-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold serif leading-tight">
              ¿Quieres participar?
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Aquí no cobramos membresía. Solo pedimos atención, curiosidad y
              ganas de hablar paja. 💜
            </p>
          </div>
          
          <div className="flex justify-center flex-col items-center gap-6">
            <div className="h-px w-20 bg-accent/30" />
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-accent">
                Únete al WhatsApp
              </p>
              <a
                href="https://chat.whatsapp.com/G99jS3ldw8pBwmZ3VD56Ah?mode=gi_t"
                target="_blank"
                className="bg-accent text-accent-foreground px-12 py-5 rounded-full font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all text-xl block"
              >
                Unirme ahora
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
