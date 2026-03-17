"use client";

import React, { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { WhatsAppIcon } from './WhatsAppIcon';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard, PlusCircle, BookOpen, Menu, X } from 'lucide-react';
import { BrandIcons } from './BrandIcons';
import { AnimatePresence } from 'framer-motion';


function Navbar() {
  const { user, isAdmin, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 [transform:translateZ(0)]">
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
                priority
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


        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          
          {user ? (
            <div className={`flex items-center gap-3 ${isMobileMenuOpen ? 'hidden md:flex' : ''}`} ref={menuRef}>
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
                
                {/* Desktop User Menu Dropdown */}
                {!isMobileMenuOpen && (
                  <div className={`absolute right-0 top-full mt-3 w-64 bg-background border border-border rounded-2xl shadow-2xl py-3 transition-all duration-300 z-[60] hidden md:block ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                    <div className="px-5 py-3 border-b border-border mb-2">
                      <p className="text-sm font-bold truncate">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded">Admin</span>
                      )}
                    </div>
                    
                    <div className="px-2 space-y-1">
                      {isAdmin && (
                        <Link 
                          href="/admin/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-accent hover:bg-accent/5 rounded-xl transition-all font-bold"
                        >
                          <LayoutDashboard size={16} />
                          <span>Panel de Control</span>
                        </Link>
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
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={() => login()}
              className="hidden md:block bg-accent text-accent-foreground px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all"
            >
              Entrar
            </button>
          )}

          {/* Mobile Menu Button - Moved here */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors z-[70]"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-background border-l border-border z-[60] md:hidden shadow-2xl overflow-y-auto h-screen h-[100dvh] will-change-transform [-webkit-overflow-scrolling:touch]"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Image src="/hpl.png" alt="Logo" width={24} height={24} />
                    <span className="font-bold tracking-tight serif text-lg">Hablar Paja <span className="text-muted-foreground">BC</span></span>
                  </div>
                </div>

                <nav className="flex flex-col gap-6 mb-10">
                  <Link 
                    href="/" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold uppercase tracking-widest hover:text-accent transition-colors border-b border-border/50 pb-2"
                  >
                    Inicio
                  </Link>
                  <Link 
                    href="/biblioteca" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold uppercase tracking-widest hover:text-accent transition-colors border-b border-border/50 pb-2"
                  >
                    Biblioteca
                  </Link>
                  <Link 
                    href="/club" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold uppercase tracking-widest hover:text-accent transition-colors border-b border-border/50 pb-2"
                  >
                    El Club
                  </Link>
                  
                  {user && isAdmin && (
                    <div className="pt-4 space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Administración</p>
                      <Link 
                        href="/admin/dashboard" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-accent transition-colors"
                      >
                        <LayoutDashboard size={18} />
                        Panel de Control
                      </Link>
                    </div>
                  )}

                  {user && (
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-red-500 mt-4 border-t border-border/50 pt-4"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  )}

                  {!user && (
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        login();
                      }}
                      className="flex items-center justify-center gap-3 w-full bg-accent text-accent-foreground font-bold uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg mt-4"
                    >
                      <LogOut size={18} className="rotate-180" />
                      Iniciar Sesión
                    </button>
                  )}
                </nav>

                <div className="mt-auto space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tema</span>
                    <ThemeToggle />
                  </div>

                  <div className="flex items-center justify-around p-4 bg-muted/30 rounded-2xl">
                    <a href="https://www.youtube.com/@hablarpajabc05" target="_blank" className="text-[#FF0000] hover:scale-110 transition-transform"><BrandIcons.YouTube /></a>
                    <a href="https://open.spotify.com/show/6LmAr5N4dbJst2AoZamjKQ?si=b2624cca2285419e" target="_blank" className="text-[#1DB954] hover:scale-110 transition-transform"><BrandIcons.Spotify /></a>
                    <a href="https://www.instagram.com/hablarpajabc/" target="_blank" className="text-[#E4405F] hover:scale-110 transition-transform"><BrandIcons.Instagram /></a>
                    <a href="https://www.tiktok.com/@hablarpajabc" target="_blank" className="text-foreground hover:scale-110 transition-transform"><BrandIcons.TikTok /></a>
                  </div>

                  <a 
                    href="https://chat.whatsapp.com/G99jS3ldw8pBwmZ3VD56Ah?mode=gi_t"
                    target="_blank"
                    className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white font-bold uppercase tracking-widest py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <WhatsAppIcon size={20} />
                    Unirme al Club
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default memo(Navbar);
