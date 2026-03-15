import React from 'react';
import Image from 'next/image';

export default function FeaturedPost() {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center mb-16">
        <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-4 lowercase">reseñas</h1>
        <p className="text-muted-foreground max-w-lg text-lg">Explora nuestras últimas opiniones y discusiones sobre los libros que nos mueven.</p>
      </div>
      
      <div className="max-w-7xl mx-auto bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border flex flex-col lg:flex-row shadow-sm hover:shadow-md transition-shadow">
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-between">
          <div>
            <span className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-8 block">Destacado</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-[1.2] serif">Por qué seguimos hablando de &quot;Cien años de soledad&quot; en 2024</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md leading-relaxed">Analizamos la vigencia del realismo mágico y cómo la obra de Gabo sigue resonando en las nuevas lecturas del club.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-border"></div>
            <div>
              <p className="text-sm font-bold">Reseña por Diego</p>
              <p className="text-xs text-muted-foreground">Marzo 14, 2024</p>
            </div>
          </div>
        </div>
        <div className="flex-1 relative min-h-[350px] lg:min-h-full">
          <Image 
            src="/blog_abstract_hero_1773530649997.png" 
            alt="Libros abstractos" 
            fill 
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
