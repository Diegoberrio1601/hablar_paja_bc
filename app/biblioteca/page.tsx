"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LibraryGrid from '@/components/LibraryGrid';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';


export default function BibliotecaPage() {
  return (
    <main className="min-h-screen text-foreground relative overflow-hidden">
      <Navbar />

      
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12 -z-10 blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Left Column: Title and Intro */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <BookOpen size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent/60">Santuario Digital</span>
              </div>

              <div className="space-y-4">
                <motion.h1 
                  className="text-5xl md:text-6xl font-black serif tracking-tight leading-[0.9]"
                  animate={{ 
                    color: ["#25D366", "#FF0000", "#FF7F00", "#8F00FF", "#25D366"],
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  La Zona <br /> <span className="opacity-90">de la Pajita</span>
                </motion.h1>
                <div className="h-1.5 w-24 bg-accent/30 rounded-full" />
              </div>

              <p className="text-xl md:text-2xl font-bold leading-tight max-w-lg text-foreground/90">
                Un santuario digital donde la paja fluye para <span className="text-accent italic underline decoration-accent/30 underline-offset-4">todes, todas y todos.</span>
              </p>
            </div>

            {/* Right Column: Detailed Text & Context */}
            <div className="lg:col-span-5 lg:pl-12">
              <div className="relative p-6 md:p-8 border border-border bg-muted/5 rounded-[2.5rem] backdrop-blur-sm">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-black text-lg rotate-12">!</div>
                
                <p className="text-base font-medium leading-relaxed text-muted-foreground">
                  Explora nuestra colección curada y prepárate para una experiencia literaria que te va a <span className="text-foreground font-bold italic">apretar la cabeza</span>. Sin prisas, sin filtros, solo el placer de leer.
                </p>
                
                <div className="mt-6 pt-6 border-t border-border flex items-center gap-4">
                  <div className="flex -space-x-1.5">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-accent/10" />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Aquí el ritmo lo pones tú.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <LibraryGrid />
        </div>
      </section>

      <Footer />
    </main>
  );
}
