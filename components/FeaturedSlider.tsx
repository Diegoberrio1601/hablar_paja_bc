"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import Skeleton from "@/components/Skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedPost {
  id: string;
  title: string;
  desc: string;
  image: string;
  category?: string;
  authorName: string;
  authorPhoto?: string;
  date?: string;
}

export default function FeaturedSlider() {
  const [posts, setPosts] = useState<FeaturedPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    const q = query(collection(db, "posts"), where("isFeatured", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const featuredData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleDateString('es-ES', { 
          day: '2-digit', month: 'long', year: 'numeric' 
        }) || "Recién publicado"
      })) as FeaturedPost[];

      // Randomizar el orden de los posts para que sea dinámico
      const shuffledData = [...featuredData].sort(() => Math.random() - 0.5);
      
      setPosts(shuffledData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  useEffect(() => {
    if (posts.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [posts.length]);

  if (loading) {
    return (
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto relative group">
          <div className="bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border flex flex-col lg:flex-row min-h-[500px]">
            <div className="flex-1 p-8 md:p-16 flex flex-col justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-8" />
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-12 w-3/4 mb-8" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-2/3" />
              </div>
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="flex-1 relative min-h-[350px] lg:min-h-full">
              <Skeleton className="absolute inset-0 rounded-none" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (posts.length === 0) return null;

  const currentPost = posts[currentIndex];

  return (
    <section className="pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto relative group">
        <div className="bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border flex flex-col lg:flex-row shadow-sm hover:shadow-md transition-all duration-700 min-h-[500px]">
          <div className="flex-1 p-8 md:p-16 flex flex-col justify-between animate-in fade-in slide-in-from-left-4 duration-700">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.2em]">Destacado</span>
                {currentPost.category && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.1em]">{currentPost.category}</span>
                  </>
                )}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-[1.2] serif line-clamp-2">{currentPost.title}</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md leading-relaxed line-clamp-3">{currentPost.desc.replace(/[#*`]/g, '')}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {currentPost.authorPhoto ? (
                  <Image 
                    src={currentPost.authorPhoto} 
                    alt={currentPost.authorName} 
                    width={40} 
                    height={40} 
                    className="rounded-full border border-border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/10 flex items-center justify-center text-accent text-[10px] font-bold">
                    {currentPost.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold">{currentPost.authorName}</p>
                  <p className="text-xs text-muted-foreground">{currentPost.date}</p>
                </div>
              </div>
              <Link 
                href={`/post/${currentPost.id}`}
                className="text-xs font-bold uppercase tracking-widest border-b-2 border-accent pb-1 hover:text-accent transition-colors"
              >
                Leer más
              </Link>
            </div>
          </div>

          <div className="flex-1 relative min-h-[350px] lg:min-h-full overflow-hidden">
            <Image 
              src={currentPost.image} 
              alt={currentPost.title} 
              fill 
              className="object-cover animate-in fade-in zoom-in-105 duration-1000"
              key={currentPost.id}
            />
          </div>
        </div>

        {/* Navigation Arrows */}
        {posts.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 shadow-lg"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 shadow-lg"
              aria-label="Siguiente"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicators */}
        {posts.length > 1 && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
            {posts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-accent' : 'w-2 bg-muted-foreground/30'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
