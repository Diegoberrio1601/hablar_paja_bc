"use client";

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BrandIcons } from './BrandIcons';


function Footer() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-background px-6 pt-24 pb-12 border-t border-border">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 mb-24">
        {/* Brand & Mission */}
        <div className="flex flex-col">
          <Link href="/" className="text-2xl font-bold tracking-tight serif mb-6 block">
            Hablar Paja <span className="text-muted-foreground">BC</span>
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
            En Hablar Paja BC no solo leemos: conectamos.
            Somos una comunidad de pajer@s que se reúne para leer junt@s, debatir sin pena y dejar que las ideas corran libres.
          </p>
          <div className="flex gap-5">
            {mounted && (
              <>
                <a 
                  href="https://www.youtube.com/@hablarpajabc05" 
                  target="_blank" 
                  className="w-10 h-10 rounded-full border border-red-500/20 flex items-center justify-center text-[#FF0000] bg-red-500/5 hover:bg-red-500/10 hover:scale-110 transition-all"
                  title="YouTube"
                >
                  <BrandIcons.YouTube />
                </a>
                <a 
                  href="https://open.spotify.com/show/6LmAr5N4dbJst2AoZamjKQ?si=b2624cca2285419e" 
                  target="_blank" 
                  className="w-10 h-10 rounded-full border border-green-500/20 flex items-center justify-center text-[#1DB954] bg-green-500/5 hover:bg-green-500/10 hover:scale-110 transition-all"
                  title="Spotify"
                >
                  <BrandIcons.Spotify />
                </a>
                <a 
                  href="https://www.instagram.com/hablarpajabc/" 
                  target="_blank"
                  className="w-10 h-10 rounded-full border border-pink-500/20 flex items-center justify-center text-[#E4405F] bg-pink-500/5 hover:bg-pink-500/10 hover:scale-110 transition-all"
                  title="Instagram"
                >
                  <BrandIcons.Instagram />
                </a>
                <a 
                  href="https://www.tiktok.com/@hablarpajabc" 
                  target="_blank" 
                  className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center text-foreground bg-black/5 hover:bg-black/10 hover:scale-110 transition-all dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
                  title="TikTok"
                >
                  <BrandIcons.TikTok />
                </a>
              </>
            )}
          </div>
        </div>

        {/* The Club Section */}
        <div className="flex flex-col md:items-end">
          <h4 className="font-bold mb-8 text-xs uppercase tracking-widest text-foreground md:text-right">El Club</h4>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 md:text-right md:max-w-xs ml-auto">
            Lecturas compartidas. Debates en vivo. Podcast donde la paja se escucha sin filtro.<br />
            Porque cuando un libro está bueno siempre provoca hablar paja un rato más. 📚😏
          </p>
          <motion.a 
            href="https://chat.whatsapp.com/G99jS3ldw8pBwmZ3VD56Ah?mode=gi_t"
            target="_blank"
            className="flex items-center gap-2 text-accent text-sm font-bold border-b-2 border-accent/20 hover:border-[#25D366] hover:text-[#25D366] pb-1 w-fit transition-all uppercase tracking-widest group md:ml-auto"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <WhatsAppIcon size={16} />
            <span>Únete al WhatsApp</span>
          </motion.a>
        </div>
      </div>

      {/* Centered Navigation */}
      <div className="max-w-7xl mx-auto flex justify-center mb-16 relative z-10">
        <nav className="flex items-center gap-12">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors relative group">
            Inicio
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/biblioteca" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors relative group">
            Biblioteca
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/club" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors relative group">
            El Club
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/unincca" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors relative group">
            Unincca
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </Link>
        </nav>
      </div>

      {/* Credits */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex justify-center items-center">
        <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} Hablar Paja Book Club. Hecho con paja y café.
        </p>
      </div>
    </footer>
  );
}

export default memo(Footer);
