"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Plus, Trash2, Edit3, Book, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  downloadUrl: string;
}

export default function AdminLibrary() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "library"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(booksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este libro?")) {
      try {
        await deleteDoc(doc(db!, "library", id));
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Verificando acceso...</div>;
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold serif mb-2">Gestión de Biblioteca</h1>
            <p className="text-muted-foreground text-sm">Administra el catálogo de libros descargables.</p>
          </div>
          <Link 
            href="/admin/biblioteca/nuevo"
            className="bg-accent text-accent-foreground px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:translate-y-[-2px] transition-all shadow-lg"
          >
            <Plus size={18} />
            Añadir Libro
          </Link>
        </div>

        <div className="bg-muted/5 border border-border rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Libro</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Autor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">URL Descarga</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-muted/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                        <Image src={book.coverImage} alt={book.title} fill className="object-cover" />
                      </div>
                      <span className="font-bold text-sm truncate max-w-[200px]">{book.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{book.author}</td>
                  <td className="px-6 py-4 text-sm">
                    <a href={book.downloadUrl} target="_blank" className="text-accent hover:underline flex items-center gap-1">
                      Link Drive <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(book.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">No hay libros en la biblioteca todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
