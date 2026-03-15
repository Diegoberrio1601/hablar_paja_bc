import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'

/**
 * Nota: Dado que estamos usando Firebase Client SDK en el proyecto, 
 * para el sitemap dinámico en el servidor (durante el build) 
 * necesitamos asegurarnos de que el sitemap se genere correctamente. 
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hablarpajabc.vercel.app'

  // Rutas estáticas
  const routes = [
    '',
    '/club',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Intentar obtener posts de Firestore si db está disponible
  let postRoutes: MetadataRoute.Sitemap = []
  
  try {
    if (db) {
      const postsRef = collection(db, "posts");
      const q = query(postsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      postRoutes = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        url: `${baseUrl}/post/${doc.id}`,
        lastModified: doc.data().createdAt?.toDate() || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error("Error generating sitemap posts:", error);
  }

  return [...routes, ...postRoutes]
}
