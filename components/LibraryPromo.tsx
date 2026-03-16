"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function LibraryPromo() {
  return (
    <section className="py-24 px-6 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-muted/5 border border-border rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <motion.div 
              className="flex-1 space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <BookOpen size={30} />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold serif leading-tight">
                  Explora Nuestra <br />
                  <span className="text-accent italic">Biblioteca Digital</span>
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-lg">
                  Un santuario para los amantes de las letras. Accede a nuestra colección curada de libros y recursos recomendados por la comunidad.
                </p>
              </div>
              
              <Link 
                href="/biblioteca"
                className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 rounded-full font-bold shadow-xl hover:translate-y-[-4px] hover:shadow-2xl transition-all group"
              >
                Visitar la Biblioteca
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div 
              className="flex-1 w-full max-w-sm aspect-[4/5] relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-accent/20 rounded-3xl rotate-6 -z-10 blur-xl" />
              <div className="w-full h-full bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-3xl flex items-center justify-center p-8">
                <motion.div 
                  className="relative w-full aspect-[2/3] bg-muted/20 rounded-xl shadow-2xl border border-border overflow-hidden"
                  whileHover={{ rotateY: 15 }}
                >
                  {/* Mock Book Spine Effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10 z-10" />
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <BookOpen size={48} className="text-accent/40" />
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Hablar Paja BC</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
