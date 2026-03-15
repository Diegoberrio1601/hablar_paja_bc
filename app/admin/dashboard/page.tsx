"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  isFeatured?: boolean;
}

export default function DashboardPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    if (!isAdmin || !db) return;
    const q = query(collection(db!, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setFetching(false);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres borrar esta reseña?")) return;
    try {
      await deleteDoc(doc(db!, "posts", id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean = false) => {
    try {
      await updateDoc(doc(db!, "posts", id), {
        isFeatured: !currentStatus
      });
    } catch (error) {
      console.error("Error updating featured status:", error);
    }
  };

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Cargando dashboard...</div>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-2 serif">Dashboard</h1>
            <p className="text-muted-foreground">Gestiona tus publicaciones y destacados.</p>
          </div>
          <Link 
            href="/admin/publicar" 
            className="bg-accent text-accent-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:translate-y-[-2px] transition-all"
          >
            Nueva reseña
          </Link>
        </div>

        <div className="bg-muted/10 rounded-[2.5rem] border border-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-8 py-6 text-xs uppercase tracking-widest font-bold text-muted-foreground">Título</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest font-bold text-muted-foreground text-center">Destacado</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest font-bold text-muted-foreground text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-8 py-6 font-medium serif text-lg">{post.title}</td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => toggleFeatured(post.id, !!post.isFeatured)}
                      className={`p-2 rounded-full transition-all ${post.isFeatured ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                      title={post.isFeatured ? "Quitar de destacados" : "Marcar como destacado"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={post.isFeatured ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right space-x-4">
                    <Link 
                      href={`/post/${post.id}`} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Ver post"
                    >
                      <svg className="inline" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                    </Link>
                    <Link 
                      href={`/admin/editar/${post.id}`} 
                      className="text-muted-foreground hover:text-accent transition-colors"
                      title="Editar post"
                    >
                      <svg className="inline" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500/70 hover:text-red-500 transition-colors"
                      title="Borrar"
                    >
                      <svg className="inline" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2-2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && !fetching && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-muted-foreground">
                    No hay publicaciones todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </main>
  );
}
