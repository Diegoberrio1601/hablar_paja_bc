"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClubPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <span className="text-accent text-xs font-bold uppercase tracking-[0.3em] block">Manifiesto Hablar Paja</span>
          <h1 className="text-5xl md:text-8xl font-bold serif leading-tight">
            Nuestra palabra <br />es el <span className="text-accent italic">vínculo</span>
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed font-light">
            No leemos para contar páginas, sino para que las páginas nos cuenten a nosotros. Hablar Paja BC nació de la necesidad de un espacio honesto, sin pretensiones, donde los libros son el punto de partida para conversaciones infinitas.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 px-6 border-t border-border bg-muted/5">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <div>
            <h3 className="text-4xl font-bold mb-6 serif">Lectura sin filtros</h3>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              En este club se permite no terminar el libro si no te gusta, se permite odiar al protagonista y se permite, sobre todo, &quot;hablar paja&quot;. Entendemos la paja como ese divagar necesario que nos lleva a las ideas más profundas sobre la vida, el amor y la sociedad.
            </p>
          </div>
        </div>
      </section>

      {/* Member CTA */}
      <section className="py-32 px-6 text-center bg-accent text-accent-foreground">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="text-4xl md:text-6xl font-bold serif">¿Quieres participar?</h2>
          <p className="text-lg opacity-90 leading-relaxed font-medium">
            No cobramos membresía, cobramos atención y ganas de debatir. <br />
            Únete a nuestro grupo de WhatsApp y prepárate para la próxima lectura conjunta.
          </p>
          <div className="flex justify-center">
            <a 
              href="https://chat.whatsapp.com/G99jS3ldw8pBwmZ3VD56Ah?mode=gi_t" 
              target="_blank"
              className="bg-background text-foreground px-12 py-5 rounded-full font-bold shadow-2xl hover:scale-105 transition-all text-xl"
            >
              Unirme al WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
