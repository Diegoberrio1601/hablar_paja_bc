"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Skeleton from '@/components/Skeleton';
import { Download, Lock, Search, BookOpen, X, Mail, CheckCircle2 } from 'lucide-react';
import { requestBookEmail, incrementDownloadCount } from '@/app/actions/library-actions';
import { toast } from 'sonner';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  downloadUrl: string;
  downloadCount?: number;
  createdAt?: any;
}

export default function LibraryGrid() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { user, login } = useAuth();

  useEffect(() => {
    // Reset email sent state when a different book is selected
    setEmailSent(false);
    setIsDescriptionExpanded(false);
  }, [selectedBook]);

  const handleRequestEmail = async (book: Book | null) => {
    if (!user?.email || !book) return;
    setSendingEmail(true);
    setEmailSent(false);
    
    try {
      const result = await requestBookEmail(user.email, book.title, book.author, book.downloadUrl);
      if (result.success) {
        setEmailSent(true);
        // Increment download count
        incrementDownloadCount(book.id)
          .then(res => {
            if (!res.success) console.error("Increment failed:", res.error);
            else console.log("Increment successful");
          })
          .catch(err => console.error("Error calling increment action:", err));
        
        toast.success("¡Libro enviado!", {
          description: "Revisa tu bandeja de entrada (y la carpeta de spam por si las moscas 🪰).",
          duration: 6000,
        });
      } else {
        toast.error(result.error || "Error al enviar el correo.");
      }
    } catch (error) {
      console.error("Error requesting book email:", error);
      toast.error("Error al procesar la solicitud.");
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!db || !mounted) return;
    // Simple query first to ensure we see all books
    const q = query(collection(db, "library")); 
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const booksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[];
        // Sort manually to avoid index issues with orderBy + where/filter
        booksData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        console.log("Books loaded:", booksData.length);
        setBooks(booksData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching library books:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [mounted]);

  if (!mounted) return null;

  const filteredBooks = books.filter(book => 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[2/3] rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto group">
        <input 
          type="text" 
          placeholder="¿Qué te quieres manosear hoy?..." 
          className="w-full bg-muted/10 border border-border px-12 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={18} />
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-24 bg-muted/5 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground">No se encontraron libros en la biblioteca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
          {filteredBooks.map((book, index) => (
            <motion.div 
              key={book.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedBook(book)}
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 border border-border shadow-sm group-hover:shadow-2xl transition-all duration-500">
                <Image 
                  src={book.coverImage || '/placeholder-book.png'} 
                  alt={book.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlay on hover - subtle hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                   <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                      <BookOpen size={20} />
                   </div>
                   {book.downloadCount !== undefined && (
                     <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 shadow-xl">
                       <Download size={12} className="text-accent" />
                       <span className="text-[10px] font-black text-white tracking-tight">{book.downloadCount} <span className="opacity-60 font-medium lowercase">descargas</span></span>
                     </div>
                   )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm group-hover:text-accent transition-colors leading-snug">{book.title}</h3>
                <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">{book.author}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
            />
            
            <motion.div 
              className="relative w-full max-w-4xl bg-background border border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <button 
                onClick={() => setSelectedBook(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 flex items-center justify-center transition-colors text-white"
              >
                <X size={20} />
              </button>

              {/* Cover info */}
              <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto relative bg-muted/5">
                <Image 
                  src={selectedBook.coverImage || '/placeholder-book.png'} 
                  alt={selectedBook.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                <div className="absolute bottom-6 left-6 right-6 md:hidden">
                   <h2 className="text-2xl font-bold text-white mb-1">{selectedBook.title}</h2>
                   <p className="text-white/80 text-xs uppercase tracking-widest font-bold">{selectedBook.author}</p>
                </div>
              </div>

              {/* Content info */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col">
                <div className="hidden md:block mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-accent text-xs font-bold uppercase tracking-widest">{selectedBook.author}</p>
                    {selectedBook.downloadCount !== undefined && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/20 px-3 py-1 rounded-full">
                          <Download size={12} className="text-accent" />
                          {selectedBook.downloadCount} descargas
                        </div>
                      </>
                    )}
                  </div>
                  <h2 className="text-4xl font-bold serif leading-tight">{selectedBook.title}</h2>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Sinopsis</h4>
                    <div className="text-muted-foreground leading-relaxed">
                      {selectedBook.description.length > 300 ? (
                        <>
                          {isDescriptionExpanded ? selectedBook.description : `${selectedBook.description.substring(0, 300)}...`}
                          <button 
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="ml-2 text-accent font-bold hover:underline"
                          >
                            {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                          </button>
                        </>
                      ) : (
                        selectedBook.description
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border">
                  {user ? (
                    emailSent ? (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center space-y-3">
                        <div className="flex justify-center text-green-500">
                          <CheckCircle2 size={32} />
                        </div>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">¡Libro enviado!</p>
                        <p className="text-xs text-muted-foreground">Revisa tu bandeja de entrada ({user.email})</p>
                      </div>
                    ) : (
                      <motion.button 
                        onClick={() => handleRequestEmail(selectedBook)}
                        disabled={sendingEmail}
                        className={`w-full ${sendingEmail ? 'bg-muted cursor-not-allowed' : 'bg-[#25D366] hover:shadow-2xl'} text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all`}
                        whileHover={!sendingEmail ? { scale: 1.02 } : {}}
                        whileTap={!sendingEmail ? { scale: 0.98 } : {}}
                      >
                        {sendingEmail ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          >
                            <Mail size={20} className="opacity-50" />
                          </motion.div>
                        ) : (
                          <Mail size={20} />
                        )}
                        {sendingEmail ? 'Enviando...' : 'Enviar a mi correo'}
                      </motion.button>
                    )
                  ) : (
                    <div className="space-y-4">
                      <p className="text-center text-xs text-muted-foreground">Debes iniciar sesión para descargar</p>
                      <button 
                        onClick={() => {
                          login();
                          setSelectedBook(null);
                        }}
                        className="w-full bg-accent text-accent-foreground py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                      >
                        <Lock size={18} />
                        Ingresar para descargar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
