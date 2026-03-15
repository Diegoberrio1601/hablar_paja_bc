"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function PublicarPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    // Optional: Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecciona una imagen válida.");
      return;
    }

    const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Error al subir la imagen.");
        setUploadProgress(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({ ...prev, image: downloadURL }));
          setUploadProgress(null);
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || isSubmitting) return;

    if (!formData.image) {
      alert("Por favor, sube una imagen para la reseña.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db!, "posts"), {
        ...formData,
        authorName: user?.displayName,
        authorPhoto: user?.photoURL,
        createdAt: serverTimestamp(),
      });
      alert("¡Reseña publicada con éxito!");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("Error al publicar. Revisa la consola.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-12 serif text-center">Crear nueva reseña</h1>
          
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

            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Imagen de portada</label>
              
              {formData.image ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-border group">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, image: ""})}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-background rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-muted/5 transition-all"
                >
                  {uploadProgress !== null ? (
                    <div className="text-center">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">Subiendo... {Math.round(uploadProgress)}%</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <p className="text-sm font-bold text-muted-foreground">Haz clic para subir una foto</p>
                    </>
                  )}
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 ml-2 italic">O pega una URL directamente</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all text-sm"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>
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

            <button 
              disabled={isSubmitting || uploadProgress !== null}
              type="submit"
              className="w-full bg-accent text-accent-foreground py-5 rounded-2xl font-bold text-lg shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {isSubmitting ? "Publicando..." : "Publicar reseña"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}
