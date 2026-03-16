"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { WhatsAppIcon } from './WhatsAppIcon';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard, PlusCircle, BookOpen } from 'lucide-react';

const BrandIcons = {
  YouTube: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  Spotify: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.218.358-.686.469-1.042.247-2.848-1.741-6.433-2.134-10.655-1.17-.407.094-.816-.16-.91-.567-.094-.408.16-.816.567-.91 4.622-1.056 8.583-.605 11.793 1.358.356.222.469.69.247 1.042zm1.467-3.258c-.273.447-.852.593-1.297.318-3.262-2.003-8.23-2.585-12.083-1.415-.504.152-1.037-.132-1.189-.636-.153-.504.133-1.037.636-1.189 4.412-1.339 9.894-.687 13.616 1.597.447.275.592.852.317 1.295v.03zm.127-3.39c-3.914-2.324-10.366-2.54-14.136-1.393-.598.182-1.238-.156-1.419-.754-.18-.598.157-1.238.754-1.419 4.316-1.31 11.436-1.054 15.947 1.623.535.318.711 1.01.393 1.545-.318.535-1.01.711-1.545.393l.006.001z"/>
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  TikTok: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1 .05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  )
};

export default function Navbar() {
  const { user, isAdmin, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-xl bg-accent/5 p-1 border border-border group-hover:border-accent/30 transition-all duration-500">
              <Image 
                src="/hpl.png" 
                alt="Logo Hablar Paja BC" 
                width={48} 
                height={48} 
                className="object-contain w-full h-full"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight serif">
              Hablar Paja <span className="text-muted-foreground">BC</span>
            </span>
          </Link>
          
          {/* Social Links - Desktop */}
          <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-border">
            {mounted && (
              <>
                <a 
                  href="https://www.youtube.com/@hablarpajabc05" 
                  target="_blank" 
                  className="text-[#FF0000] hover:scale-110 transition-transform"
                  title="YouTube"
                >
                  <BrandIcons.YouTube />
                </a>
                <a 
                  href="https://open.spotify.com/show/6LmAr5N4dbJst2AoZamjKQ?si=b2624cca2285419e" 
                  target="_blank" 
                  className="text-[#1DB954] hover:scale-110 transition-transform"
                  title="Spotify"
                >
                  <BrandIcons.Spotify />
                </a>
                <a 
                  href="https://www.instagram.com/hablarpajabc/" 
                  target="_blank"
                  className="text-[#E4405F] hover:scale-110 transition-transform"
                  title="Instagram"
                >
                  <BrandIcons.Instagram />
                </a>
                <a 
                  href="https://www.tiktok.com/@hablarpajabc" 
                  target="_blank"
                  className="text-foreground hover:scale-110 transition-transform"
                  title="TikTok"
                >
                  <BrandIcons.TikTok />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Central Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors relative group">
            Inicio
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/biblioteca" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors relative group">
            Biblioteca
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/club" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors relative group">
            El Club
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden md:flex items-center gap-4">
            <motion.a 
              href="https://chat.whatsapp.com/G99jS3ldw8pBwmZ3VD56Ah?mode=gi_t"
              target="_blank"
              className="text-xs font-bold uppercase tracking-widest bg-accent/10 text-accent px-5 py-2.5 rounded-full transition-all flex items-center gap-2 group hover:bg-[#25D366] hover:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <WhatsAppIcon size={16} />
              Unirme al Club
            </motion.a>
          </div>

          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-3" ref={menuRef}>
              <div className="relative">
                <div 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-muted/50 transition-colors ring-1 ${isMenuOpen ? 'ring-accent bg-accent/5' : 'ring-border'}`}
                >
                  <Image 
                    src={user.photoURL || "/default-avatar.png"} 
                    alt={user.displayName || "User"} 
                    width={32} 
                    height={32} 
                    className="rounded-full"
                  />
                </div>
                
                <div className={`absolute right-0 top-full mt-3 w-64 bg-background border border-border rounded-2xl shadow-2xl py-3 transition-all duration-300 z-[60] ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                  <div className="px-5 py-3 border-b border-border mb-2">
                    <p className="text-sm font-bold truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded">Admin</span>
                    )}
                  </div>
                  
                  <div className="px-2 space-y-1">
                    {isAdmin && (
                      <>
                        <Link 
                          href="/admin/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                        >
                          <LayoutDashboard size={16} />
                          <span>Dashboard</span>
                        </Link>
                        <Link 
                          href="/admin/publicar"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                        >
                          <PlusCircle size={16} />
                          <span>Publicar reseña</span>
                        </Link>
                        <Link 
                          href="/admin/biblioteca"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                        >
                          <BookOpen size={16} />
                          <span>Gestionar Biblioteca</span>
                        </Link>
                      </>
                    )}
                    
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-all mt-2 pt-3 border-t border-border"
                    >
                      <LogOut size={16} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={login}
              className="bg-accent text-accent-foreground px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
