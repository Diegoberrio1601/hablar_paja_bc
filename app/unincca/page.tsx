"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Image from 'next/image';

import { getDriveVideoTitle } from '@/app/actions/unincca-actions';

export default function UninccaPage() {
  const [videos, setVideos] = React.useState([
    {
      id: "1o6DV-HEvIoPj_uXMXEVl6HeF6FCAdBaW",
      title: "", // Will be fetched
      url: "https://drive.google.com/file/d/1o6DV-HEvIoPj_uXMXEVl6HeF6FCAdBaW/preview",
      thumbnail: "/unincca.jpg"
    }
  ]);

  React.useEffect(() => {
    async function fetchTitles() {
      const updatedVideos = await Promise.all(
        videos.map(async (v) => {
          if (!v.title) {
            const title = await getDriveVideoTitle(v.id);
            return { ...v, title };
          }
          return v;
        })
      );
      setVideos(updatedVideos);
    }
    fetchTitles();
  }, []);

  return (
    <main className="min-h-screen text-foreground relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-accent/5 skew-x-12 -z-10 blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="flex flex-col md:flex-row gap-8 items-end justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Play size={20} fill="currentColor" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent/60">Gestión Académica</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black serif tracking-tight">
                  Entregas <span className="text-accent underline decoration-accent/20">Unincca</span>
                </h1>
                <p className="text-lg md:text-xl font-medium text-muted-foreground max-w-xl">
                  Archivo temporal de proyectos, tareas y material audiovisual universitario.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Grid Section */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
            
            {/* Placeholder for more videos if desired */}
            <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground/40 p-8 grayscale">
               <Play size={24} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Espacio para más tareas</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function VideoCard({ video }: { video: any }) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <motion.div 
      className="group relative flex flex-col gap-4"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-black/10 backdrop-blur-sm shadow-lg group-hover:shadow-accent/10 transition-all duration-500">
        {isPlaying ? (
          <iframe
            src={video.url}
            className="w-full h-full border-0"
            allow="encrypted-media"
            allowFullScreen
            title={video.title || "Cargando..."}
          />
        ) : (
          <div 
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full cursor-pointer group"
          >
            <Image 
              src={video.thumbnail} 
              alt={video.title || "Cargando..."}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-accent group-hover:border-accent transition-all duration-300 shadow-xl">
                <Play size={32} fill="currentColor" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="px-2">
        <div className="min-h-[2.5rem]">
          {video.title ? (
            <h3 className="font-bold text-sm uppercase tracking-widest text-foreground/80 leading-snug whitespace-normal break-words transition-all duration-500">
              {video.title}
            </h3>
          ) : (
            <div className="h-4 w-3/4 bg-muted/20 animate-pulse rounded-full" />
          )}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-accent/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Material de apoyo</p>
          <a 
            href={`https://drive.google.com/file/d/${video.id}/view?usp=sharing`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors flex items-center gap-1.5"
          >
            Ver en Drive
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
