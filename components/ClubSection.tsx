"use client";

import React from 'react';
import { Users, Mic2, MessageSquareText } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { motion } from 'framer-motion';

export default function ClubSection() {
  return (
    <section className="py-24 px-6 bg-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12">
          <div className="space-y-8">
            <span className="text-accent text-xs font-bold uppercase tracking-[0.2em]">Únete a nosotros</span>
            <h2 className="text-4xl md:text-7xl font-bold serif leading-tight">
              Hablar Paja BC: <br />
              <span className="text-muted-foreground italic">Mucho más que un club de lectura</span>
            </h2>
            <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed mx-auto max-w-2xl">
              Somos una comunidad vibrante donde las historias cobran vida fuera de los libros. 
              Si te apasiona debatir, compartir y descubrir nuevas perspectivas, este es tu lugar.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-accent mx-auto">
                  <Users size={32} />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Comunidad</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Lecturas conjuntas y debates activos cada mes.</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-accent mx-auto">
                  <Mic2 size={32} />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Podcast</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Participa en nuestras grabaciones en vivo.</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-accent mx-auto">
                  <MessageSquareText size={32} />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Debates</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Sin censura, sin paja, solo la esencia literaria.</p>
              </div>
            </div>

            <motion.div 
              className="pt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.a 
                href="https://chat.whatsapp.com/G99jS3ldw8pBwmZ3VD56Ah?mode=gi_t" 
                target="_blank"
                className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-5 rounded-full font-bold shadow-2xl transition-all text-lg group hover:bg-[#25D366] hover:text-white"
                whileHover={{ 
                  scale: 1.05,
                  translateY: -4,
                  boxShadow: "0 25px 50px -12px rgba(37, 211, 102, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <WhatsAppIcon />
                <span>Quiero unirme ahora</span>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
