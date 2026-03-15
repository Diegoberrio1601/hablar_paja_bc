import React from 'react';

export default function Newsletter() {
  return (
    <section className="py-24 px-6 border-t border-border bg-muted/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl md:text-5xl font-bold mb-6 serif">Recibe recomendaciones semanales</h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg">Únete a nuestra comunidad de lectores y no te pierdas nuestras charlas y reseñas exclusivas.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto md:mx-0">
            <input 
              type="email" 
              placeholder="Tu mejor correo..." 
              className="flex-1 bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all text-sm"
            />
            <button className="bg-accent text-accent-foreground px-8 py-4 rounded-2xl text-sm font-bold shadow-sm hover:translate-y-[-2px] hover:shadow-lg transition-all active:translate-y-[0px]">
              Suscribirme
            </button>
          </div>
        </div>
        <div className="md:w-1/3 flex flex-col items-center md:items-start">
          <h4 className="font-bold mb-6 uppercase tracking-[0.2em] text-xs">Síguenos</h4>
          <div className="flex gap-6">
            <a href="#" className="p-3 bg-muted/40 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="#" className="p-3 bg-muted/40 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="p-3 bg-muted/40 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
