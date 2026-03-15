"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function EditarPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    image: "",
    isFeatured: false,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id || !isAdmin) return;
      try {
        const docRef = doc(db, "posts", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            title: data.title || "",
            desc: data.desc || "",
            image: data.image || "",
            isFeatured: !!data.isFeatured,
          });
        } else {
          router.push("/admin/dashboard");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchPost();
  }, [id, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const docRef = doc(db, "posts", id as string);
      await updateDoc(docRef, {
        ...formData,
      });
      alert("¡Reseña actualizada con éxito!");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error al actualizar. Revisa la consola.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || fetching || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Cargando editor...</div>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-12 serif text-center">Editar reseña</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8 bg-muted/20 p-8 md:p-12 rounded-[2.5rem] border border-border">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Título de la reseña</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej. Por qué leer a Murakami"
                  className="w-full bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all serif text-xl"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-3 ml-2">
                <input 
                  type="checkbox" 
                  id="isFeatured"
                  className="w-5 h-5 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                />
                <label htmlFor="isFeatured" className="text-sm font-bold text-muted-foreground cursor-pointer select-none">Marcar como contenido destacado (Slider principal)</label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">URL de la imagen (Unsplash/Pinterest)</label>
              <input 
                required
                type="text" 
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Contenido (Soporta Markdown)</label>
                <span className="text-[10px] text-muted-foreground">Puedes usar: **negrita**, *cursiva*, # títulos, - listas</span>
              </div>
              <textarea 
                required
                rows={12}
                placeholder="Cuéntanos de qué trata o por qué te gustó... (¡Puedes usar Markdown!)"
                className="w-full bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all resize-none leading-relaxed font-mono text-sm"
                value={formData.desc}
                onChange={(e) => setFormData({...formData, desc: e.target.value})}
              />
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => router.push("/admin/dashboard")}
                className="flex-1 bg-muted text-muted-foreground py-5 rounded-2xl font-bold text-lg hover:bg-muted/80 transition-all"
              >
                Cancelar
              </button>
              <button 
                disabled={isSubmitting}
                type="submit"
                className="flex-[2] bg-accent text-accent-foreground py-5 rounded-2xl font-bold text-lg shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}
