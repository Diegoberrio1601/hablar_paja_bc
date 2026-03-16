"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  getDocs,
  collectionGroup,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Users, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Ban,
  UserCheck,
  Eye,
  X,
  AlertTriangle,
  Clock,
  AlertCircle,
  Search,
  Download,
  Upload
} from "lucide-react";
import Skeleton from "@/components/Skeleton";
import { incrementDownloadCount } from "@/app/actions/library-actions";

// Helper for skeleton rows
const TableSkeleton = ({ rows = 5, cols = 3 }: { rows?: number, cols?: number }) => (
  <div className="w-full animate-in fade-in duration-300">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-8 py-5 border-b border-border/50">
        {[...Array(cols)].map((_, j) => (
          <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-1/2' : 'flex-1'} rounded-full`} />
        ))}
      </div>
    ))}
  </div>
);

interface Post {
  id: string;
  title: string;
  category?: string;
  bookAuthor?: string;
  image?: string;
  desc?: string;
  isFeatured?: boolean;
  createdAt?: any;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage: string;
  downloadUrl: string;
  downloadCount?: number;
  createdAt?: any;
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isBanned?: boolean;
  bannedUntil?: any;
}

interface CommentData {
  id: string;
  text: string;
  userName: string;
  postId: string;
  postTitle?: string;
}

type TabType = "posts" | "library" | "comments" | "users";

export default function DashboardPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [banDuration, setBanDuration] = useState<number | "permanent">(7);
  const [banReason, setBanReason] = useState("");
  const [customReason, setCustomReason] = useState(false);

  const banReasons = [
    "Comportamiento tóxico o lenguaje ofensivo.",
    "Spam o publicidad no autorizada.",
    "Incumplimiento repetido de las normas del club.",
    "Contenido inapropiado en los comentarios.",
    "Suplantación de identidad."
  ];

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV rows
    const csvContent = [
      headers.join(","), // Header row
      ...data.map(row => 
        headers.map(header => {
          let cell = row[header] === null || row[header] === undefined ? "" : row[header];
          
          // Handle Firestore Timestamps
          if (typeof cell === 'object' && cell.seconds) {
            cell = new Date(cell.seconds * 1000).toLocaleString();
          }
          
          // Escape quotes and handle strings
          const escaped = String(cell).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(",")
      )
    ].join("\n");

    // Create and trigger download
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (csvText: string) => {
    const lines: string[] = [];
    let currentLine = "";
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      if (char === '"') inQuotes = !inQuotes;
      if (char === '\n' && !inQuotes) {
        lines.push(currentLine);
        currentLine = "";
      } else {
        currentLine += char;
      }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    return lines.slice(1).map(line => {
      const values: string[] = [];
      let currentValue = "";
      let inQuotesCell = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotesCell = !inQuotesCell;
        else if (char === ',' && !inQuotesCell) {
          values.push(currentValue.replace(/""/g, '"').trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.replace(/""/g, '"').trim());

      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });
  };

  const handleImportPosts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const text = event.target.result;
        const data = parseCSV(text);
        if (data.length === 0) return;

        let added = 0;
        let skipped = 0;

        for (const item of data) {
          const title = item['Título'];
          if (!title) continue;

          // Duplicate check
          const exists = posts.some(p => p.title.toLowerCase() === title.toLowerCase());
          if (exists) {
            skipped++;
            continue;
          }

          try {
            await addDoc(collection(db!, "posts"), {
              title: title,
              category: item['Categoría'] || 'Libros',
              bookAuthor: item['Autor'] || '',
              isFeatured: item['Contenido Destacado'] === 'Sí',
              image: item['Imagen Portada'] || item['URL de la imagen'] || '',
              desc: item['CONTENIDO (MARKDOWN)'] || '',
              authorName: "Importado",
              createdAt: serverTimestamp()
            });
            added++;
          } catch (err) {
            console.error("Error importing post:", err);
          }
        }
        toast.success(`Importación finalizada`, {
          description: `${added} reseñas añadidas, ${skipped} omitidas por existir previamente.`
        });
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleImportBooks = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const text = event.target.result;
        const data = parseCSV(text);
        if (data.length === 0) return;

        let added = 0;
        let skipped = 0;

        for (const item of data) {
          const title = item['Título'];
          const author = item['Autor'];
          if (!title || !author) continue;

          // Duplicate check
          const exists = books.some(b => 
            b.title.toLowerCase() === title.toLowerCase() && 
            b.author.toLowerCase() === author.toLowerCase()
          );
          if (exists) {
            skipped++;
            continue;
          }

          try {
            await addDoc(collection(db!, "library"), {
              title: title,
              author: author,
              downloadCount: parseInt(item['Descargas']) || 0,
              downloadUrl: item['URL'] || '',
              description: item['sinapsis'] || '',
              coverImage: "", // We don't export/import local cover images easily via CSV
              createdAt: serverTimestamp()
            });
            added++;
          } catch (err) {
            console.error("Error importing book:", err);
          }
        }
        toast.success(`Importación finalizada`, {
          description: `${added} libros añadidos, ${skipped} omitidas por existir previamente.`
        });
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleImportUsers = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const text = event.target.result;
        const data = parseCSV(text);
        if (data.length === 0) return;

        let added = 0;
        let skipped = 0;

        for (const item of data) {
          const email = item['Email'];
          if (!email) continue;

          // Duplicate check
          const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
          if (exists) {
            skipped++;
            continue;
          }

          try {
            await addDoc(collection(db!, "users"), {
              displayName: item['Nombre'] || 'Usuario Importado',
              email: email,
              photoURL: "",
              isBanned: item['Estado'] === 'Banneado',
              lastLogin: serverTimestamp(),
              createdAt: serverTimestamp()
            });
            added++;
          } catch (err) {
            console.error("Error importing user:", err);
          }
        }
        toast.success(`Importación finalizada`, {
          description: `${added} usuarios añadidos, ${skipped} omitidas por existir previamente.`
        });
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExportPosts = () => {
    const dataToExport = posts.map(p => ({
      Título: p.title,
      Categoría: p.category || 'N/A',
      Autor: p.bookAuthor || 'N/A',
      'Contenido Destacado': p.isFeatured ? "Sí" : "No",
      'Imagen Portada': p.image || 'N/A',
      'URL de la imagen': p.image || 'N/A',
      'CONTENIDO (MARKDOWN)': p.desc || ''
    }));
    exportToCSV(dataToExport, "Reseñas_HablarPaja");
  };

  const handleExportBooks = () => {
    const dataToExport = books.map(b => ({
      Título: b.title,
      Autor: b.author,
      Descargas: b.downloadCount || 0,
      URL: b.downloadUrl,
      sinapsis: b.description || ''
    }));
    exportToCSV(dataToExport, "Biblioteca_HablarPaja");
  };

  const handleExportUsers = () => {
    const dataToExport = users.map(u => ({
      ID: u.uid,
      Nombre: u.displayName,
      Email: u.email,
      Estado: u.isBanned ? "Banneado" : "Activo",
      'Baneo Hasta': u.bannedUntil ? new Date(u.bannedUntil.seconds * 1000).toLocaleString() : 'N/A'
    }));
    exportToCSV(dataToExport, "Usuarios_HablarPaja");
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (!isAdmin || !db) return;

    setLoading(true);

    const unsubscribers: (() => void)[] = [];
    // Track how many snapshots have loaded
    let loadedCount = 0;
    const totalToLoad = 4;

    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        setLoading(false);
      }
    };

    // Posts Subscription
    const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
      checkLoaded();
    });
    unsubscribers.push(unsubPosts);

    // Library Subscription
    const qBooks = query(collection(db, "library"), orderBy("createdAt", "desc"));
    const unsubBooks = onSnapshot(qBooks, (snap) => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Book)));
      checkLoaded();
    });
    unsubscribers.push(unsubBooks);

    // Users Subscription
    const qUsers = query(collection(db, "users"), orderBy("lastLogin", "desc"));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setUsers(snap.docs.map(d => ({ 
        uid: d.id, 
        email: d.data().email,
        displayName: d.data().displayName,
        photoURL: d.data().photoURL,
        isBanned: d.data().isBanned
      } as UserData)));
      checkLoaded();
    });
    unsubscribers.push(unsubUsers);

    // Comments Subscription
    const qComments = query(collectionGroup(db, "comments"), orderBy("createdAt", "desc"));
    const unsubComments = onSnapshot(qComments, (snap) => {
      setComments(snap.docs.map(d => ({ 
        id: d.id, 
        postId: d.ref.parent.parent?.id || "",
        ...d.data() 
      } as CommentData)));
      checkLoaded();
    });
    unsubscribers.push(unsubComments);

    return () => unsubscribers.forEach(fn => fn());
  }, [isAdmin]);

  // Actions
  const deletePost = async (id: string) => {
    if (confirm("¿Borrar reseña?")) await deleteDoc(doc(db!, "posts", id));
  };

  const deleteBook = async (id: string) => {
    if (confirm("¿Borrar libro de la biblioteca?")) await deleteDoc(doc(db!, "library", id));
  };

  const deleteComment = async (postId: string, commentId: string) => {
    if (confirm("¿Borrar comentario?")) await deleteDoc(doc(db!, "posts", postId, "comments", commentId));
  };


  const toggleFeatured = async (id: string, current: boolean) => {
    await updateDoc(doc(db!, "posts", id), { isFeatured: !current });
  };


  const executeBan = async () => {
    if (!selectedUser) return;
    
    const finalReason = customReason ? banReason : (banReason || banReasons[0]);
    
    let bannedUntil = null;
    if (banDuration !== "permanent") {
      const date = new Date();
      date.setDate(date.getDate() + (banDuration as number));
      bannedUntil = date;
    }

    try {
      await updateDoc(doc(db!, "users", selectedUser.uid), {
        isBanned: true,
        bannedUntil: bannedUntil,
        banReason: finalReason
      });

      // Notify via Email
      const durationLabel = [
        { val: 7, label: "1 Semana" },
        { val: 15, label: "15 Días" },
        { val: 30, label: "1 Mes" },
        { val: "permanent", label: "Permanente" }
      ].find(o => o.val === banDuration)?.label || "Temporal";

      fetch('/api/admin/notify-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedUser.email,
          name: selectedUser.displayName,
          duration: durationLabel,
          reason: finalReason
        })
      }).catch(err => console.error("Email notification error:", err));

      setIsBanModalOpen(false);
      setSelectedUser(null);
      setBanReason("");
      setCustomReason(false);
    } catch (error) {
      console.error("Error banning user:", error);
      alert("Error al banear al usuario.");
    }
  };

  const executeUnban = async () => {
    if (!selectedUser) return;
    try {
      await updateDoc(doc(db!, "users", selectedUser.uid), { 
        isBanned: false, 
        bannedUntil: null,
        banReason: null
      });
      
      // Notify via Email
      fetch('/api/admin/notify-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedUser.email,
          name: selectedUser.displayName,
          type: 'unban'
        })
      }).catch(err => console.error("Email notification error:", err));
      
      setIsUnbanModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error unbanning user:", error);
      alert("Error al quitar el baneo.");
    }
  };

  const deleteUser = async (uid: string) => {
    if (confirm("¿Eliminar registro de usuario?")) await deleteDoc(doc(db!, "users", uid));
  };

  if (authLoading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Accediendo al Panel de Control...</div>;
  }

  const tabs = [
    { id: "posts", label: "Reseñas", icon: LayoutDashboard },
    { id: "library", label: "Biblioteca", icon: BookOpen },
    { id: "comments", label: "Comentarios", icon: MessageSquare },
    { id: "users", label: "Usuarios", icon: Users },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 serif">Administración</h1>
            <p className="text-muted-foreground">Unifica y gestiona toda la plataforma desde aquí.</p>
          </div>

          <div className="relative w-full md:w-96 group">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full bg-muted/10 border border-border px-12 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors">
              <Search size={18} />
            </div>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-muted/20 p-1.5 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-muted/10 border border-border rounded-[2.5rem] overflow-hidden shadow-sm min-h-[400px]">
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="animate-in fade-in duration-500">
              <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="font-bold serif text-2xl mb-1">Gestión de Reseñas</h3>
                  <p className="text-xs text-muted-foreground font-medium">Administra y organiza tus publicaciones literarias</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                    <button 
                      onClick={handleImportPosts}
                      className="px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
                    >
                      <Upload size={14} /> Importar
                    </button>
                    <div className="w-[1px] bg-border/50 my-1 mx-1" />
                    <button 
                      onClick={handleExportPosts}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
                    >
                      <Download size={14} /> Exportar
                    </button>
                  </div>
                  <Link href="/admin/publicar" className="bg-accent text-accent-foreground px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20">
                    <PlusCircle size={16} /> NUEVA RESEÑA
                  </Link>
                </div>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Destacar</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-0">
                        <TableSkeleton rows={8} cols={3} />
                      </td>
                    </tr>
                  ) : (
                    posts
                      .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(post => (
                        <tr key={post.id} className="hover:bg-muted/5 transition-colors group">
                          <td className="px-8 py-5 font-medium serif text-lg">{post.title}</td>
                          <td className="px-8 py-5 text-center">
                            <button onClick={() => toggleFeatured(post.id, !!post.isFeatured)} className={`p-2 rounded-full ${post.isFeatured ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={post.isFeatured ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </button>
                          </td>
                          <td className="px-8 py-5 text-right space-x-2">
                            <Link href={`/post/${post.id}`} className="inline-flex p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"><Eye size={18} /></Link>
                            <Link href={`/admin/editar/${post.id}`} className="inline-flex p-2 text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-lg transition-all"><Edit3 size={18} /></Link>
                            <button onClick={() => deletePost(post.id)} className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Library Tab */}
          {activeTab === "library" && (
            <div className="animate-in fade-in duration-500">
              <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="font-bold serif text-2xl mb-1">Gestión de Biblioteca</h3>
                  <p className="text-xs text-muted-foreground font-medium">Controla el catálogo de libros digitales y descargas</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                    <button 
                      onClick={handleImportBooks}
                      className="px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
                    >
                      <Upload size={14} /> Importar
                    </button>
                    <div className="w-[1px] bg-border/50 my-1 mx-1" />
                    <button 
                      onClick={handleExportBooks}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
                    >
                      <Download size={14} /> Exportar
                    </button>
                  </div>
                  <Link href="/admin/biblioteca/nuevo" className="bg-accent text-accent-foreground px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20">
                    <PlusCircle size={16} /> AÑADIR LIBRO
                  </Link>
                </div>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Obra</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Descarga</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Popularidad</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-0">
                        <TableSkeleton rows={5} cols={3} />
                      </td>
                    </tr>
                  ) : (
                    books
                      .filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(book => (
                        <tr key={book.id} className="hover:bg-muted/5 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <Image src={book.coverImage} alt={book.title} width={40} height={56} className="rounded object-cover border border-border shadow-sm" />
                              <div>
                                <p className="font-bold text-sm">{book.title}</p>
                                <p className="text-xs text-muted-foreground">{book.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <a 
                              href={book.downloadUrl} 
                              target="_blank" 
                              onClick={() => incrementDownloadCount(book.id).catch(console.error)}
                              className="text-accent text-xs flex items-center gap-1 hover:underline"
                            >
                              Enlace Drive <ExternalLink size={12} />
                            </a>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/30 rounded-full text-[10px] font-bold">
                              <Download size={12} className="text-accent" />
                              {book.downloadCount || 0} <span className="opacity-50 font-medium">descargas</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right space-x-2">
                            <Link href={`/admin/biblioteca/editar/${book.id}`} className="inline-flex p-2 text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-lg transition-all"><Edit3 size={18} /></Link>
                            <button onClick={() => deleteBook(book.id)} className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <div className="animate-in fade-in duration-500">
              <div className="p-8 border-b border-border">
                <h3 className="font-bold serif text-xl">Moderación de Comentarios</h3>
              </div>
              <div className="divide-y divide-border">
                {loading ? (
                  <TableSkeleton rows={6} cols={2} />
                ) : (
                  <>
                    {comments
                      .filter(c => c.userName.toLowerCase().includes(searchTerm.toLowerCase()) || c.text.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(comment => (
                        <div key={comment.id} className="p-6 hover:bg-muted/5 transition-all group flex justify-between items-start">
                          <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{comment.userName}</span>
                              <span className="text-[10px] uppercase text-muted-foreground">En Post ID: {comment.postId}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">"{comment.text}"</p>
                          </div>
                          <button onClick={() => deleteComment(comment.postId, comment.id)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    {comments.length === 0 && <p className="p-12 text-center text-muted-foreground">No hay comentarios para moderar.</p>}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="animate-in fade-in duration-500">
              <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="font-bold serif text-2xl mb-1">Gestión de Usuarios</h3>
                  <p className="text-xs text-muted-foreground font-medium">Administra miembros, roles y sanciones de la comunidad</p>
                </div>
                <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50 self-start md:self-auto">
                  <button 
                    onClick={handleImportUsers}
                    className="px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    <Upload size={14} /> Importar
                  </button>
                  <div className="w-[1px] bg-border/50 my-1 mx-1" />
                  <button 
                    onClick={handleExportUsers}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    <Download size={14} /> Exportar
                  </button>
                </div>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Usuario</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Estado</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-0">
                        <TableSkeleton rows={6} cols={3} />
                      </td>
                    </tr>
                  ) : (
                    users
                      .filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(u => (
                        <tr key={u.uid} className="hover:bg-muted/5 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <Image src={u.photoURL || "/default-avatar.png"} alt={u.displayName} width={32} height={32} className="rounded-full ring-1 ring-border" />
                              <div>
                                <p className="text-sm font-bold">{u.displayName}</p>
                                <p className="text-[10px] text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            {u.isBanned ? (
                              <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-bold uppercase tracking-widest rounded">Baneado</span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-bold uppercase tracking-widest rounded">Activo</span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right space-x-2">
                            {u.isBanned ? (
                              <button 
                                onClick={() => {
                                  setSelectedUser(u);
                                  setIsUnbanModalOpen(true);
                                }} 
                                className="p-2 rounded-lg text-green-500 hover:bg-green-500/10 transition-all" 
                                title="Quitar baneo"
                              >
                                <UserCheck size={18} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setSelectedUser(u);
                                  setIsBanModalOpen(true);
                                }} 
                                className="p-2 rounded-lg text-orange-500 hover:bg-orange-500/10 transition-all" 
                                title="Banear usuario"
                              >
                                <Ban size={18} />
                              </button>
                            )}
                            <button onClick={() => deleteUser(u.uid)} className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all" title="Eliminar"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      {isBanModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setIsBanModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-background border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-orange-500/10 p-3 rounded-2xl">
                  <AlertTriangle className="text-orange-500" size={24} />
                </div>
                <button 
                  onClick={() => setIsBanModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-2xl font-bold serif mb-2">Banear Usuario</h2>
              <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
                Estás a punto de suspender la cuenta de <span className="text-foreground font-bold">{selectedUser.displayName}</span>. El usuario no podrá comentar ni acceder a funciones del Club.
              </p>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">Motivo de la suspensión</label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {banReasons.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setBanReason(r);
                          setCustomReason(false);
                        }}
                        className={`text-left px-4 py-3 rounded-xl text-xs border transition-all ${
                          !customReason && banReason === r 
                            ? "bg-foreground/5 border-foreground text-foreground font-semibold" 
                            : "bg-muted/30 border-border text-muted-foreground hover:border-accent/30"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                    <button
                      onClick={() => setCustomReason(true)}
                      className={`text-left px-4 py-3 rounded-xl text-xs border transition-all ${
                        customReason 
                          ? "bg-foreground/5 border-foreground text-foreground font-semibold" 
                          : "bg-muted/30 border-border text-muted-foreground hover:border-accent/30"
                      }`}
                    >
                      Escribir motivo personalizado...
                    </button>
                  </div>
                  
                  {customReason && (
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Escribe aquí la razón..."
                      className="w-full bg-muted/30 border border-border rounded-xl p-4 text-xs focus:ring-1 focus:ring-foreground outline-none transition-all resize-none h-24"
                    />
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">Duración de la suspensión</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 7, label: "1 Semana" },
                      { val: 15, label: "15 Días" },
                      { val: 30, label: "1 Mes" },
                      { val: "permanent", label: "Permanente" }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setBanDuration(opt.val as any)}
                        className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                          banDuration === opt.val 
                            ? "bg-foreground text-background border-foreground shadow-md" 
                            : "bg-muted/30 border-border text-muted-foreground hover:border-accent/30"
                        }`}
                      >
                        <Clock size={14} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-2xl border border-border">
                  <div className="flex gap-3">
                    <Image src={selectedUser.photoURL || "/default-avatar.png"} alt="" width={32} height={32} className="rounded-full h-8 w-8" />
                    <div>
                      <p className="text-xs font-bold">{selectedUser.displayName}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsBanModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-full text-xs font-bold border border-border hover:bg-muted transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeBan}
                  className="flex-1 px-6 py-3 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                >
                  Confirmar Ban
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unban Modal */}
      {isUnbanModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setIsUnbanModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-background border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center bg-green-500/10 p-4 rounded-full mb-6">
                <UserCheck className="text-green-500" size={32} />
              </div>

              <h2 className="text-2xl font-bold serif mb-2">Restaurar Cuenta</h2>
              <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
                ¿Estás seguro de que deseas levantar la suspensión a <span className="text-foreground font-bold">{selectedUser.displayName}</span>? Se le enviará un correo notificándole que ya puede volver al Club.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsUnbanModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-full text-xs font-bold border border-border hover:bg-muted transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeUnban}
                  className="flex-1 px-6 py-3 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
