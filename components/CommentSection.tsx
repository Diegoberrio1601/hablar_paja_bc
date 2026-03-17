"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc,
  doc,
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { MessageSquare, Reply, Send, User, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto: string;
  createdAt: Timestamp;
  parentId: string | null;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, login } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este comentario y todas sus respuestas?")) return;
    
    try {
      // Función recursiva para borrar hijos
      const deleteRecursive = async (id: string) => {
        const children = comments.filter(c => c.parentId === id);
        for (const child of children) {
          await deleteRecursive(child.id);
        }
        await deleteDoc(doc(db!, "posts", postId, "comments", id));
      };

      await deleteRecursive(commentId);
    } catch (error) {
      console.error("Error deleting comment tree:", error);
    }
  };

  useEffect(() => {
    if (!postId || !db) return;

    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!user || isSubmitting) return;
    
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db!, "posts", postId, "comments"), {
        text,
        userId: user.uid,
        userName: user.displayName || "Usuario Anónimo",
        userPhoto: user.photoURL || "",
        createdAt: serverTimestamp(),
        parentId
      });
      
      if (parentId) {
        setReplyTo(null);
        setReplyText("");
      } else {
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComments = (parentId: string | null = null, depth = 0) => {
    return comments
      .filter(comment => comment.parentId === parentId)
      .map(comment => (
        <div key={comment.id} className={`mt-6 ${depth > 0 ? 'ml-8 md:ml-12 border-l-2 border-border pl-4 md:pl-6' : ''}`}>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {comment.userPhoto ? (
                <Image 
                  src={comment.userPhoto} 
                  alt={comment.userName} 
                  width={40} 
                  height={40} 
                  className="rounded-full ring-1 ring-border" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User size={20} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm tracking-tight">{comment.userName}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  {comment.createdAt?.toDate().toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
              
              <div className="flex items-center gap-4">
                {user && (
                  <button 
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:opacity-80 transition-all pt-1"
                  >
                    <Reply size={12} />
                    Responder
                  </button>
                )}
                
                {user?.uid === comment.userId && (
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:opacity-80 transition-all pt-1"
                  >
                    <Trash2 size={12} />
                    Eliminar
                  </button>
                )}
              </div>

              {replyTo === comment.id && (
                <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 flex gap-3">
                  <input 
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    autoFocus
                  />
                  <button 
                    disabled={isSubmitting || !replyText.trim()}
                    type="submit"
                    className="bg-accent text-accent-foreground p-2 rounded-full hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
          {renderComments(comment.id, depth + 1)}
        </div>
      ));
  };

  return (
    <section className="mt-24 pt-16 border-t border-border max-w-4xl mx-auto px-4 md:px-0">
      <div className="flex items-center gap-3 mb-12">
        <MessageSquare size={24} className="text-accent" />
        <h3 className="text-2xl font-bold serif">Conversación</h3>
        <span className="bg-muted px-2 py-0.5 rounded text-xs font-bold text-muted-foreground uppercase">{comments.length}</span>
      </div>

      {user ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-16 space-y-4">
          <div className="flex gap-4">
            <Image 
              src={user.photoURL || "/default-avatar.png"} 
              alt={user.displayName || "User"} 
              width={40} 
              height={40} 
              className="rounded-full ring-1 ring-border h-10 w-10 flex-shrink-0" 
            />
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="¿Qué piensas de esta lectura?"
              className="flex-1 bg-muted/30 border border-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all min-h-[100px] resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button 
              disabled={isSubmitting || !newComment.trim()}
              type="submit"
              className="bg-accent text-accent-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:translate-y-[-2px] disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar comentario'}
              <Send size={16} />
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-16 p-8 bg-accent/5 rounded-[2rem] border border-accent/10 border-dashed text-center space-y-4">
          <p className="text-muted-foreground">Únete a la conversación para compartir tus ideas.</p>
          <button 
            onClick={() => login()}
            className="bg-accent text-accent-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Iniciar sesión para comentar
          </button>
        </div>
      )}

      <div className="space-y-8">
        {comments.length > 0 ? (
          renderComments(null)
        ) : (
          <p className="text-center text-muted-foreground italic py-12">Aún no hay comentarios. ¡Sé el primero en hablar paja!</p>
        )}
      </div>
    </section>
  );
}
