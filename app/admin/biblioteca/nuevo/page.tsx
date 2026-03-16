"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Book, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewBook() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    downloadUrl: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!imageFile) {
      setErrorMessage("Por favor, selecciona una portada.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Upload Cover Image
      const storageRef = ref(storage!, `library/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      const coverImageUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });

      // 2. Save to Firestore
      await addDoc(collection(db!, "library"), {
        ...formData,
        coverImage: coverImageUrl,
        downloadCount: 0,
        createdAt: serverTimestamp()
      });

      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error("Error adding book:", error);
      setErrorMessage(error.message || "Hubo un error al guardar el libro.");
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Verificando...</div>;
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-32 pb-24 px-6 max-w-2xl mx-auto">
        <Link 
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent mb-8 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Volver al Panel de Control
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
            <Book size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold serif">Nuevo Libro</h1>
            <p className="text-muted-foreground text-sm">Añade un ejemplar a la biblioteca digital.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image Upload */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portada del libro</label>
            <div className={`relative aspect-[2/3] max-w-[200px] mx-auto rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${imagePreview ? 'border-accent shadow-2xl' : 'border-border hover:border-accent/40'}`}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">Cambiar imagen</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Upload className="mx-auto text-muted-foreground" size={24} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Seleccionar JPG/PNG</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título del libro</label>
              <input 
                required
                className="w-full bg-muted/10 border border-border px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                placeholder="Ej: Rayuela"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Autor</label>
              <input 
                required
                className="w-full bg-muted/10 border border-border px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                placeholder="Ej: Julio Cortázar"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Descripción corta</label>
              <textarea 
                required
                rows={4}
                className="w-full bg-muted/10 border border-border px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium resize-none"
                placeholder="De qué trata este libro..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">URL de Google Drive</label>
              <input 
                required
                type="url"
                className="w-full bg-muted/10 border border-border px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                placeholder="https://drive.google.com/..."
                value={formData.downloadUrl}
                onChange={(e) => setFormData({...formData, downloadUrl: e.target.value})}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle size={18} />
              {errorMessage}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-accent-foreground py-5 rounded-2xl font-bold shadow-2xl hover:translate-y-[-2px] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                {uploadProgress !== null ? `Subiendo portada... ${Math.round(uploadProgress)}%` : "Guardando..."}
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Guardar Libro en Biblioteca
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
