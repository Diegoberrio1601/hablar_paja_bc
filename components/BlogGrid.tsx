"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Skeleton from '@/components/Skeleton';

interface Post {
  id: string;
  title: string;
  desc: string;
  image: string;
  category?: string;
  month?: string;
  authorName?: string;
  authorPhoto?: string;
  date?: string;
}

export default function BlogGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["Todos", "Libros", "Autores", "Recomendaciones", "Libro del Mes"];

  useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleDateString('es-ES', { 
          day: '2-digit', month: 'long', year: 'numeric' 
        }) || "Recién publicado"
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "Todos" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-end mb-12">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-6 w-24" />
        </div>
        {/* Filter bar skeleton */}
        <div className="max-w-7xl mx-auto flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="block">
              <Skeleton className="aspect-[3/4] rounded-3xl mb-8" />
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold serif">Últimas entradas</h2>
        
        <div className="relative w-full md:w-96 group">
          <input 
            type="text" 
            placeholder="Buscar por título o contenido..." 
            className="w-full bg-muted/10 border border-border px-12 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat 
                ? 'bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20' 
                : 'bg-muted/10 text-muted-foreground border-border hover:border-accent/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center py-24 bg-muted/10 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground">No se encontraron entradas en la categoría {selectedCategory}.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} className="group cursor-pointer block">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-8 border border-border shadow-sm group-hover:shadow-xl transition-all duration-500">
                <Image 
                  src={post.image || '/blog_post_1_1773530662580.png'} 
                  alt={post.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Category Tag */}
                {post.category && (
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-black px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {post.category}
                    </span>
                    {post.category === "Libro del Mes" && post.month && (
                      <span className="bg-accent/90 backdrop-blur-sm text-accent-foreground px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {post.month}
                      </span>
                    )}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Leer reseña</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>{post.date}</span>
                </div>
                
                {/* Author Info */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/20 overflow-hidden border border-accent/10">
                    {post.authorPhoto ? (
                      <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent text-[8px] font-bold">
                        {post.authorName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">{post.authorName}</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4 group-hover:text-muted-foreground transition-colors serif leading-snug">{post.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">{post.desc.replace(/[#*`]/g, '')}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
