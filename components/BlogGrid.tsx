"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Post {
  id: string;
  title: string;
  desc: string;
  image: string;
  date?: string;
}

export default function BlogGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) {
    return <section className="py-16 px-6 max-w-7xl mx-auto">Cargando reseñas...</section>;
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-12">
        <h2 className="text-3xl md:text-4xl font-bold serif">Últimas entradas</h2>
        <a href="#" className="text-sm font-bold border-b-2 border-accent pb-1">Ver todas ({posts.length})</a>
      </div>
      
      {posts.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center py-24 bg-muted/10 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground">Aún no hay reseñas publicadas. ¡Sé el primero en publicar una!</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} className="group cursor-pointer block">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-8 border border-border shadow-sm group-hover:shadow-xl transition-all duration-500">
                <Image 
                  src={post.image || '/blog_post_1_1773530662580.png'} 
                  alt={post.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Leer reseña</span>
                </div>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <span>{post.date}</span>
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
