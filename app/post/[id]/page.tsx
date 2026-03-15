"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CommentSection from "@/components/CommentSection";
import { useAuth } from "@/context/AuthContext";

interface Post {
  title: string;
  desc: string;
  category?: string;
  image: string;
  authorName: string;
  authorPhoto: string;
  createdAt: { toDate: () => Date };
}

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id || !db) return;
      try {
        const docRef = doc(db!, "posts", id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPost(docSnap.data() as Post);
        } else {
          console.error("No such document!");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando lectura...</div>;
  }

  if (!post) return null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <article className="pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-7xl font-bold mb-8 serif leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center gap-4">
              <Image 
                src={post.authorPhoto || "/default-avatar.png"} 
                alt={post.authorName} 
                width={48} 
                height={48} 
                className="rounded-full ring-2 ring-border"
              />
              <div className="text-left">
                <p className="font-bold text-sm">{post.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {post.createdAt?.toDate().toLocaleDateString('es-ES', { 
                    day: '2-digit', month: 'long', year: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => router.push(`/admin/editar/${id}`)}
                  className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-accent text-accent-foreground px-6 py-3 rounded-full shadow-lg hover:translate-y-[-2px] transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                  Editar esta reseña
                </button>
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-16 border border-border shadow-2xl">
            <Image 
              src={post.image} 
              alt={post.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>

          {/* Content with Markdown support */}
          <div className="max-w-none serif leading-relaxed text-xl prose prose-neutral dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.desc}
            </ReactMarkdown>
          </div>

          <CommentSection postId={id as string} />
          
          <div className="mt-20 pt-10 border-t border-border flex justify-between items-center">
            <button 
              onClick={() => router.push("/")}
              className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors"
            >
              <svg className="group-hover:-translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Volver al inicio
            </button>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
