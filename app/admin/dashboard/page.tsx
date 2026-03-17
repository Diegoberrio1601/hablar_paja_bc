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
  serverTimestamp,
  limit
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
  Calendar,
  Video,
  Ban,
  UserCheck,
  Eye,
  X,
  AlertTriangle,
  Clock,
  AlertCircle,
  Search,
  Download,
  Upload,
  Loader2,
  Bell,
  Send,
  Check
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

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: any;
  duration: number;
  location: string;
  calendarEventId?: string;
  reminderSent?: boolean;
  autoReminder?: boolean;
  reminderLeadTime?: number;
  reminderSentAt?: any;
  createdAt?: any;
}

type TabType = "posts" | "library" | "comments" | "users" | "meetings";

export default function DashboardPage() {
  const { isAdmin, loading: authLoading, calendarToken, login, setCalendarToken } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal States
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [banDuration, setBanDuration] = useState<number | "permanent">(7);
  const [banReason, setBanReason] = useState("");
  const [customReason, setCustomReason] = useState(false);

  // Meeting Form States
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingsFormData, setMeetingsFormData] = useState([{
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    location: "",
    autoReminder: true,
    reminderLeadTime: 60
  }]);

  const addMeetingSlot = () => {
    setMeetingsFormData([...meetingsFormData, {
      title: "",
      description: "",
      date: "",
      time: "",
      duration: 60,
      location: "",
      autoReminder: true,
      reminderLeadTime: 60
    }]);
  };

  const removeMeetingSlot = (index: number) => {
    if (meetingsFormData.length <= 1) return;
    setMeetingsFormData(meetingsFormData.filter((_, i) => i !== index));
  };

  const updateMeetingSlot = (index: number, data: any) => {
    const newMeetings = [...meetingsFormData];
    newMeetings[index] = { ...newMeetings[index], ...data };
    setMeetingsFormData(newMeetings);
  };

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

  const generateGoogleCalendarUrl = (meeting: Meeting) => {
    // meeting.date might be a Firestore Timestamp or a Date object during creation
    const startDate = meeting.date.seconds ? new Date(meeting.date.seconds * 1000) : meeting.date;
    const endDate = new Date(startDate.getTime() + meeting.duration * 60000);
    
    const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const url = new URL("https://www.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", meeting.title);
    url.searchParams.append("dates", `${formatTime(startDate)}/${formatTime(endDate)}`);
    url.searchParams.append("details", meeting.description);
    url.searchParams.append("location", meeting.location);
    url.searchParams.append("sf", "true");
    url.searchParams.append("output", "xml");
    
    return url.toString();
  };

  const syncToGoogleCalendar = async (meeting: any) => {
    if (!calendarToken) {
      toast.error("No hay token de calendario. Por favor, re-autentícate.");
      return null;
    }

    try {
      const startDate = meeting.date;
      const endDate = new Date(startDate.getTime() + (meeting.duration || 60) * 60000);

      const event = {
        summary: meeting.title,
        description: meeting.description,
        location: meeting.location,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${calendarToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const err = await response.json();
        if (response.status === 401) {
          setCalendarToken(null);
          toast.error("Tu sesión de Google ha expirado", {
            description: "Por favor, vuelve a activar la sincronización.",
            action: {
              label: "Reconectar",
              onClick: () => login(true)
            }
          });
        }
        throw new Error(err.error?.message || "Error al sincronizar");
      }

      const data = await response.json();
      if (data.htmlLink) {
        toast.success("¡Sincronizado con Google Calendar! ✨", {
          description: "Haz clic para ver el evento",
          action: {
            label: "Ver Evento",
            onClick: () => window.open(data.htmlLink, "_blank")
          }
        });
      } else {
        toast.success("¡Sincronizado directamente con Google Calendar! ✨");
      }
      return data.id; // Return the event ID
    } catch (error: any) {
      console.error("Calendar sync error:", error);
      toast.error(`Error de sincronización: ${error.message}`);
      return null;
    }
  };

  const deleteFromGoogleCalendar = async (eventId: string) => {
    if (!calendarToken) return false;

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${calendarToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log("Event already deleted from Google Calendar");
          return true;
        }
        if (response.status === 401) {
          setCalendarToken(null);
        }
        const err = await response.json();
        throw new Error(err.error?.message || "Error al eliminar de Google Calendar");
      }

      return true;
    } catch (error: any) {
      console.error("Google Calendar delete error:", error);
      return false;
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsSyncing(true);
    try {
      for (const formData of meetingsFormData) {
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        
        const meetingData = {
          title: formData.title,
          description: formData.description,
          date: startDateTime,
          duration: parseInt(formData.duration.toString()),
          location: formData.location,
          autoReminder: formData.autoReminder,
          reminderLeadTime: formData.reminderLeadTime
        };

        let calendarEventId = "";
        // Try automatic sync if token is available
        if (calendarToken) {
          const syncId = await syncToGoogleCalendar(meetingData);
          if (syncId) calendarEventId = syncId;
        } else {
          // Fallback to manual link if no token
          const calendarUrl = generateGoogleCalendarUrl(meetingData as any);
          window.open(calendarUrl, "_blank");
          toast.info(`Calendario abierto para: ${formData.title}`);
        }

        await addDoc(collection(db, "meetings"), {
          ...meetingData,
          calendarEventId,
          reminderSent: false,
          createdAt: serverTimestamp()
        });
      }

      setIsMeetingModalOpen(false);
      setMeetingsFormData([{
        title: "",
        description: "",
        date: "",
        time: "",
        duration: 60,
        location: "",
        autoReminder: true,
        reminderLeadTime: 60
      }]);
      toast.success("¡Todas las reuniones han sido programadas! 🚀");
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Error al programar las reuniones.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualReminder = async (meeting: Meeting) => {
    try {
      const response = await fetch('/api/cron/meeting-reminders', {
        headers: {
          'x-meeting-id': meeting.id
        }
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success(`Recordatorio enviado a ${result.emailsSent} usuarios ✨`);
      } else {
        toast.error("Error al enviar el recordatorio: " + (result.error || "Error desconocido"));
      }
    } catch (error) {
      console.error("Manual reminder error:", error);
      toast.error("Error de conexión al enviar el recordatorio");
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!db || !confirm("¿Estás seguro de que quieres eliminar esta reunión?")) return;
    
    try {
      // Find the meeting to get the calendarEventId
      const meeting = meetings.find(m => m.id === id);
      
      if (meeting?.calendarEventId && calendarToken) {
        await deleteFromGoogleCalendar(meeting.calendarEventId);
      }

      await deleteDoc(doc(db, "meetings", id));
      toast.success("Reunión eliminada");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Error al eliminar");
    }
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
    const totalToLoad = 5;

    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        setLoading(false);
      }
    };

    // Posts Subscription
    const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
    const unsubPosts = onSnapshot(qPosts, 
      (snap) => {
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
        checkLoaded();
      },
      (err) => console.error("Error en suscripción de RESEÑAS:", err)
    );
    unsubscribers.push(unsubPosts);

    // Library Subscription
    const qBooks = query(collection(db, "library"), orderBy("createdAt", "desc"), limit(50));
    const unsubBooks = onSnapshot(qBooks, 
      (snap) => {
        setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Book)));
        checkLoaded();
      },
      (err) => console.error("Error en suscripción de BIBLIOTECA:", err)
    );
    unsubscribers.push(unsubBooks);

    // Users Subscription
    const qUsers = query(collection(db, "users"), orderBy("lastLogin", "desc"), limit(50));
    const unsubUsers = onSnapshot(qUsers, 
      (snap) => {
        setUsers(snap.docs.map(d => ({ 
          uid: d.id, 
          email: d.data().email,
          displayName: d.data().displayName,
          photoURL: d.data().photoURL,
          isBanned: d.data().isBanned
        } as UserData)));
        checkLoaded();
      },
      (err) => console.error("Error en suscripción de USUARIOS:", err)
    );
    unsubscribers.push(unsubUsers);

    // Comments Subscription
    const qComments = query(collectionGroup(db, "comments"), orderBy("createdAt", "desc"), limit(50));
    const unsubComments = onSnapshot(qComments, 
      (snap) => {
        setComments(snap.docs.map(d => ({ 
          id: d.id, 
          postId: d.ref.parent.parent?.id || "",
          ...d.data() 
        } as CommentData)));
        checkLoaded();
      },
      (err) => console.error("Error en suscripción de COMENTARIOS:", err)
    );
    unsubscribers.push(unsubComments);

    // Meetings Subscription (Keep all as they are usually few, but limit to 20 just in case)
    const qMeetings = query(collection(db, "meetings"), orderBy("date", "asc"), limit(20));
    const unsubMeetings = onSnapshot(qMeetings, 
      (snap) => {
        setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Meeting)));
        checkLoaded();
      },
      (err) => console.error("Error en suscripción de REUNIONES:", err)
    );
    unsubscribers.push(unsubMeetings);

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
    { id: "meetings", label: "Reuniones", icon: Calendar },
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
          {/* Meetings Tab */}
          {activeTab === "meetings" && (
            <div className="animate-in fade-in duration-500">
              <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="font-bold serif text-2xl mb-1">Próximas Reuniones</h3>
                  <p className="text-xs text-muted-foreground font-medium">Gestiona los encuentros y eventos del club</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  {!calendarToken && (
                    <button 
                      onClick={() => login(true)}
                      className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-[10px] font-black hover:bg-blue-500/20 transition-all flex items-center gap-2"
                    >
                      <Video size={14} /> ACTIVAR SINCRONIZACIÓN DIRECTA
                    </button>
                  )}
                  <button 
                    onClick={() => setIsMeetingModalOpen(true)}
                    className="bg-accent text-accent-foreground px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20"
                  >
                    <PlusCircle size={16} /> PROGRAMAR REUNIÓN
                  </button>
                </div>
              </div>

              <div className="p-8">
                {meetings.length === 0 ? (
                  <div className="text-center py-24 bg-muted/20 border-2 border-dashed border-border rounded-[2rem]">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                      <Calendar size={32} />
                    </div>
                    <p className="text-muted-foreground font-medium">No hay reuniones programadas</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {meetings.map((meeting) => (
                      <div key={meeting.id} className="bg-muted/20 border border-border p-8 rounded-[2rem] hover:border-accent/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-colors" />
                        
                        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-widest mb-1">
                                <span className="w-1 h-1 rounded-full bg-accent" />
                                {new Date(meeting.date.seconds * 1000).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                              </div>
                              <h4 className="text-2xl font-bold serif">{meeting.title}</h4>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {meeting.description || "Sin descripción proporcionada."}
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                                <Clock size={14} className="text-accent" />
                                {new Date(meeting.date.seconds * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ({meeting.duration} min)
                              </div>
                              {meeting.location && (
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-background/50 px-3 py-1.5 rounded-lg border border-border/50 max-w-[200px] truncate">
                                  <Video size={14} className="text-accent" />
                                  <span className="truncate">{meeting.location}</span>
                                </div>
                              )}
                              
                              {meeting.autoReminder && (
                                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                                  meeting.reminderSent 
                                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                    : "bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse"
                                }`}>
                                  {meeting.reminderSent ? <Check size={12} /> : <Bell size={12} />}
                                  {meeting.reminderSent ? "RECORDATORIO ENVIADO" : `PENDIENTE (${meeting.reminderLeadTime || 60}m)`}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col gap-2 justify-end">
                            {meeting.autoReminder && !meeting.reminderSent && (
                              <button 
                                onClick={() => handleManualReminder(meeting)}
                                className="bg-foreground text-background p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-[10px] font-black"
                                title="Enviar recordatorio ahora"
                              >
                                <Send size={16} /> ENVIAR AHORA
                              </button>
                            )}
                            <a 
                              href={generateGoogleCalendarUrl(meeting)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-accent text-accent-foreground p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 text-[10px] font-black"
                              title="Añadir a Google Calendar"
                            >
                              <ExternalLink size={16} /> GOOGLE CALENDAR
                            </a>
                            <button 
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Eliminar"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Creation Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-background/80 backdrop-blur-2xl w-full max-w-6xl max-h-[95vh] rounded-[2.5rem] p-6 md:p-10 border border-white/20 shadow-[0_32px_128px_rgba(0,0,0,0.4)] relative flex flex-col overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full -ml-48 -mb-48 blur-[100px] pointer-events-none" />

            <button 
              onClick={() => setIsMeetingModalOpen(false)}
              className="absolute top-6 right-6 p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-all z-10"
            >
              <X size={18} />
            </button>

            <div className="mb-6 relative shrink-0">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/20 rounded-xl mb-4 shadow-inner ring-1 ring-white/20">
                <Calendar className="text-accent" size={24} />
              </div>
              <h3 className="text-3xl font-bold serif mb-1 tracking-tight">Programar Reuniones</h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-[400px]">
                Configura tus encuentros en paralelo. Desliza horizontalmente para ver todos los bloques.
              </p>
            </div>

            <form onSubmit={handleCreateMeeting} className="relative flex-1 flex flex-col min-h-0">
              <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-5 pb-6 px-1 custom-scrollbar scroll-smooth flex-1 min-h-0">
                {meetingsFormData.map((formData, index) => (
                  <div key={index} className="flex-shrink-0 w-full md:w-[440px] snap-center space-y-5 p-6 bg-white/5 rounded-[2rem] border border-white/10 relative group/slot shadow-lg overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full uppercase tracking-widest">Reunión #{index + 1}</span>
                        {index === 0 && <span className="text-[8px] text-accent font-bold uppercase tracking-tighter opacity-70">Principal</span>}
                      </div>
                      {meetingsFormData.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeMeetingSlot(index)}
                          className="text-red-500/50 hover:text-red-500 p-1.5 transition-all hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground/60 ml-3 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-accent" /> Título
                      </label>
                      <input 
                        required
                        type="text" 
                        placeholder="Nombre de la reunión..."
                        className="w-full bg-muted/30 hover:bg-muted/50 px-6 py-3.5 rounded-[1.5rem] border border-white/10 outline-none focus:ring-4 focus:ring-accent/5 transition-all font-bold text-base placeholder:text-muted-foreground/30 shadow-inner group-focus-within/input:border-accent/30"
                        value={formData.title}
                        onChange={(e) => updateMeetingSlot(index, { title: e.target.value })}
                        disabled={isSyncing}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground/60 ml-3">Fecha</label>
                        <input 
                          required
                          type="date" 
                          className="w-full bg-muted/30 hover:bg-muted/50 px-5 py-3 rounded-[1.2rem] border border-white/10 outline-none focus:ring-4 focus:ring-accent/5 transition-all font-black text-xs appearance-none"
                          value={formData.date}
                          onChange={(e) => updateMeetingSlot(index, { date: e.target.value })}
                          disabled={isSyncing}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground/60 ml-3">Hora</label>
                        <input 
                          required
                          type="time" 
                          className="w-full bg-muted/30 hover:bg-muted/50 px-5 py-3 rounded-[1.2rem] border border-white/10 outline-none focus:ring-4 focus:ring-accent/5 transition-all font-black text-xs appearance-none"
                          value={formData.time}
                          onChange={(e) => updateMeetingSlot(index, { time: e.target.value })}
                          disabled={isSyncing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground/60 ml-3">Duración</label>
                        <div className="relative">
                          <input 
                            required
                            type="number" 
                            className="w-full bg-muted/30 hover:bg-muted/50 px-5 py-3 rounded-[1.2rem] border border-white/10 outline-none focus:ring-4 focus:ring-accent/5 transition-all font-black text-xs"
                            value={formData.duration}
                            onChange={(e) => updateMeetingSlot(index, { duration: parseInt(e.target.value) })}
                            disabled={isSyncing}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30">MIN</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground/60 ml-3">Ubicación</label>
                        <input 
                          type="text" 
                          placeholder="Meet / Zoom"
                          className="w-full bg-muted/30 hover:bg-muted/50 px-5 py-3 rounded-[1.2rem] border border-white/10 outline-none focus:ring-4 focus:ring-accent/5 transition-all font-black text-xs"
                          value={formData.location}
                          onChange={(e) => updateMeetingSlot(index, { location: e.target.value })}
                          disabled={isSyncing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-black text-muted-foreground/60 ml-3">Descripción</label>
                      <textarea 
                        rows={2}
                        placeholder="Opcional..."
                        className="w-full bg-muted/30 hover:bg-muted/50 px-5 py-3 rounded-[1.2rem] border border-white/10 outline-none focus:ring-4 focus:ring-accent/5 transition-all font-medium resize-none text-[11px]"
                        value={formData.description}
                        onChange={(e) => updateMeetingSlot(index, { description: e.target.value })}
                        disabled={isSyncing}
                      />
                    </div>

                    <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-black tracking-widest uppercase text-accent/80">Recordatorio por Email</label>
                          <span className="text-[8px] text-muted-foreground">Notificar a todos los usuarios</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => updateMeetingSlot(index, { autoReminder: !formData.autoReminder })}
                          className={`w-12 h-6 rounded-full p-1 transition-all ${formData.autoReminder ? 'bg-accent' : 'bg-muted/30'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.autoReminder ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {formData.autoReminder && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                          <label className="text-[9px] font-bold text-muted-foreground mb-2 block">¿Con cuánta antelación?</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[15, 30, 60, 120].map((mins) => (
                              <button
                                key={mins}
                                type="button"
                                onClick={() => updateMeetingSlot(index, { reminderLeadTime: mins })}
                                className={`py-2 rounded-lg text-[9px] font-black border transition-all ${
                                  formData.reminderLeadTime === mins 
                                    ? "bg-accent text-accent-foreground border-accent" 
                                    : "bg-background/20 border-white/5 text-muted-foreground hover:bg-white/5"
                                }`}
                              >
                                {mins >= 60 ? `${mins/60}H` : `${mins}M`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button 
                  type="button"
                  onClick={addMeetingSlot}
                  disabled={isSyncing}
                  className="flex-shrink-0 w-full md:w-[260px] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-all font-black uppercase tracking-widest text-[10px] snap-center group"
                >
                  <div className="w-14 h-14 bg-muted/30 rounded-full flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                    <PlusCircle size={28} />
                  </div>
                  <span>Añadir otra</span>
                </button>
              </div>

              <div className="pt-6 shrink-0 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSyncing}
                  className="w-full md:w-auto md:min-w-[340px] bg-accent text-accent-foreground py-4 px-10 rounded-[2rem] font-black text-lg shadow-xl shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  {isSyncing ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="animate-spin" size={20} />
                      PROCESANDO {meetingsFormData.length} REUNIONES...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      GUARDAR {meetingsFormData.length} REUNIONES <ExternalLink size={18} className="opacity-50" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
