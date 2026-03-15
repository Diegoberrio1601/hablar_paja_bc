"use client";

import React from 'react';
import Link from 'next/link';
import { WhatsAppIcon } from './WhatsAppIcon';
import { motion } from 'framer-motion';

const BrandIcons = {
  YouTube: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  Spotify: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.218.358-.686.469-1.042.247-2.848-1.741-6.433-2.134-10.655-1.17-.407.094-.816-.16-.91-.567-.094-.408.16-.816.567-.91 4.622-1.056 8.583-.605 11.793 1.358.356.222.469.69.247 1.042zm1.467-3.258c-.273.447-.852.593-1.297.318-3.262-2.003-8.23-2.585-12.083-1.415-.504.152-1.037-.132-1.189-.636-.153-.504.133-1.037.636-1.189 4.412-1.339 9.894-.687 13.616 1.597.447.275.592.852.317 1.295v.03zm.127-3.39c-3.914-2.324-10.366-2.54-14.136-1.393-.598.182-1.238-.156-1.419-.754-.18-.598.157-1.238.754-1.419 4.316-1.31 11.436-1.054 15.947 1.623.535.318.711 1.01.393 1.545-.318.535-1.01.711-1.545.393l.006.001z"/>
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  )
};

export default function Footer() {
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
            Un espacio para los que aman los libros, la paja y no tienen miedo de decir lo que piensan.
            Buscamos la esencia de las historias más allá de las páginas.
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
              </>
            )}
          </div>
        </div>

        {/* The Club Section */}
        <div className="flex flex-col">
          <h4 className="font-bold mb-8 text-xs uppercase tracking-widest text-foreground">El Club</h4>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            No solo leemos, conectamos. El club Hablar Paja BC es una comunidad activa con lecturas conjuntas, debates en vivo y podcast semanales.
          </p>
          <motion.a 
            href="https://chat.whatsapp.com/G99jS3ldw8pBwmZ3VD56Ah?mode=gi_t"
            target="_blank"
            className="flex items-center gap-2 text-accent text-sm font-bold border-b-2 border-accent/20 hover:border-[#25D366] hover:text-[#25D366] pb-1 w-fit transition-all uppercase tracking-widest group"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <WhatsAppIcon size={16} />
            <span>Únete al WhatsApp</span>
          </motion.a>
        </div>
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
