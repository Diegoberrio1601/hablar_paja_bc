"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import MarkdownPreview from "@/components/MarkdownPreview";

export default function EditarPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    image: "",
    bookAuthor: "",
    category: "Libros",
    month: "",
    isFeatured: false,
  });

  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const categories = ["Libros", "Autores", "Recomendaciones", "Libro del Mes"];

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id || !isAdmin || !db) return;
      try {
        const docRef = doc(db!, "posts", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            title: data.title || "",
            desc: data.desc || "",
            image: data.image || "",
            bookAuthor: data.bookAuthor || "",
            category: data.category || "Libros",
            month: data.month || "",
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const generatePrompt = () => {
    const { title, bookAuthor, category, month } = formData;
    const base = `Actúa como un crítico literario experto y redactor de blogs. `;
    
    const prompts: Record<string, string> = {
      "Libros": `Escribe una reseña profunda y cautivadora del libro "${title}" de ${bookAuthor}. Incluye un resumen sin spoilers, análisis de temas y por qué vale la pena leerlo.`,
      "Autores": `Escribe un perfil literario detallado del autor ${bookAuthor}, enfocándote en su estilo, legado y mencionando su obra destacada "${title}".`,
      "Recomendaciones": `Escribe una recomendación entusiasta para leer "${title}" de ${bookAuthor}. Explica a qué tipo de lectores les gustaría y qué lo hace especial.`,
      "Libro del Mes": `Escribe el anuncio oficial para el Libro del Mes de ${month}: "${title}" de ${bookAuthor}. Debe ser una invitación irresistible para que l@s pajer@s empiecen a leerlo y se preparen para la pajita literaria.`
    };

    return `${base}${prompts[category] || prompts["Libros"]} Usa un tono cercano, elegante y profesional. Devuélveme el contenido en formato Markdown con subtítulos y negritas.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || isSubmitting) return;

    if (!formData.image) {
      alert("La reseña debe tener una imagen.");
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(db!, "posts", id as string);
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
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-12 serif text-center">Editar reseña</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} className="space-y-8 bg-muted/20 p-8 md:p-12 rounded-[2.5rem] border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Categoría</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all font-bold appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Autor del Libro</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Haruki Murakami"
                    className="w-full bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all font-bold"
                    value={formData.bookAuthor}
                    onChange={(e) => setFormData({...formData, bookAuthor: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-end gap-6 ml-2">
                <div className="flex items-center gap-3 py-4">
                  <input 
                    type="checkbox" 
                    id="isFeatured"
                    className="w-5 h-5 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  />
                  <label htmlFor="isFeatured" className="text-sm font-bold text-muted-foreground cursor-pointer select-none">Contenido destacado</label>
                </div>

                {formData.category === "Libro del Mes" && (
                  <div className="flex-1 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Mes del Libro</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all font-bold appearance-none cursor-pointer"
                        value={formData.month}
                        onChange={(e) => setFormData({...formData, month: e.target.value})}
                      >
                        <option value="" disabled>Selecciona un mes</option>
                        {months.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                )}
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
                        <p className="text-sm font-bold text-muted-foreground text-center px-4">Haz clic para subir una foto o usa una URL abajo</p>
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
                
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all text-sm"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <div className="bg-accent/5 p-6 rounded-3xl border border-accent/20 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest text-accent">Asistente de Prompt para IA</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => copyToClipboard(generatePrompt(), 'prompt')}
                      className="text-[10px] font-bold bg-accent text-accent-foreground px-3 py-1.5 rounded-full hover:scale-105 transition-transform"
                    >
                      {copySuccess === 'prompt' ? '¡Copiado!' : 'Copiar Prompt'}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-accent/30 pl-4">
                    {generatePrompt()}
                  </p>
                </div>

                <div className="flex justify-between items-center ml-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Contenido (Markdown)</label>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => copyToClipboard(formData.desc, 'md')}
                      className="text-[10px] font-bold text-accent hover:underline"
                    >
                      {copySuccess === 'md' ? '¡Markdown Copiado!' : 'Copiar contenido'}
                    </button>
                    <span className="text-[10px] text-muted-foreground animate-pulse">Escribe a la izquierda, previsualiza a la derecha →</span>
                  </div>
                </div>
                <textarea 
                  required
                  rows={15}
                  placeholder="Cuéntanos de qué trata o por qué te gustó..."
                  className="w-full bg-background px-6 py-4 rounded-2xl border border-border outline-none focus:ring-2 focus:ring-accent/10 transition-all resize-none leading-relaxed font-mono text-sm min-h-[400px]"
                  value={formData.desc}
                  onChange={(e) => setFormData({...formData, desc: e.target.value})}
                />
              </div>

              <div className="flex gap-4 border-t border-border pt-8 mt-8">
                <button 
                  type="button"
                  onClick={() => router.push("/admin/dashboard")}
                  className="flex-1 bg-muted text-muted-foreground py-5 rounded-2xl font-bold text-lg hover:bg-muted/80 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  disabled={isSubmitting || uploadProgress !== null}
                  type="submit"
                  className="flex-[2] bg-accent text-accent-foreground py-5 rounded-2xl font-bold text-lg shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>

            {/* Right Column: Preview */}
            <div className="sticky top-32 h-[calc(100vh-160px)] hidden lg:block">
              <MarkdownPreview content={formData.desc} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
