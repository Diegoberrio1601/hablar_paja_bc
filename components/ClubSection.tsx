"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Mic2, MessageSquareText } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export default function ClubSection() {
  return (
    <section className="py-24 px-6 bg-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12">
          <div className="space-y-8">
            <span className="text-accent text-xs font-bold uppercase tracking-[0.2em]">ÚNETE A LA PAJITA</span>
            <h2 className="text-4xl md:text-7xl font-bold serif leading-tight">
              Hablar Paja BC <br />
              <span className="text-muted-foreground italic text-3xl md:text-4xl block mt-2">Donde los libros te aprietan la cabeza… y las ideas se corren.</span>
            </h2>
            <div className="text-muted-foreground text-lg md:text-xl leading-relaxed mx-auto max-w-2xl space-y-4 font-medium">
              <p>Somos una comunidad donde las historias no solo se leen. Se saborean, se comentan y se disfrutan sin prisa.</p>
              <p>Aquí nos gusta hablar paja sin pena, dejar que los libros nos lleven… y cuando una historia está buena, darle otra vuelta más.</p>
              <p className="text-foreground italic">
                Si eres de quienes disfrutan una buena pajita literaria, de esas que empiezan suave… pero terminan explotándote la cabeza, entonces este es tu lugar.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-accent mx-auto">
                  <Users size={32} />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">COMUNIDAD</h4>
                <p className="text-xs text-muted-foreground leading-relaxed px-4">
                  Cada mes nos reunimos para hacer la pajita juntos. Leemos el mismo libro, lo comentamos y dejamos que la conversación se ponga intensa.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-accent mx-auto">
                  <Mic2 size={32} />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">PODCAST</h4>
                <p className="text-xs text-muted-foreground leading-relaxed px-4">
                  Algunas pajitas merecen hacerse en voz alta. Por eso grabamos nuestros encuentros para que escuches cómo las ideas empiezan a fluir.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-accent mx-auto">
                  <MessageSquareText size={32} />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">DEBATES</h4>
                <p className="text-xs text-muted-foreground leading-relaxed px-4">
                  Sin censura. Sin rodeos. Sin paja innecesaria. Solo el libro, las ideas y las ganas de darle duro a la conversación.
                </p>
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
