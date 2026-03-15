import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Metadata, ResolvingMetadata } from "next";
import PostContent from "@/app/post/[id]/PostContent";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = (await params).id;
  
  if (!db) return { title: "Post | Hablar Paja BC" };

  try {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const post = docSnap.data();
      const previousImages = (await parent).openGraph?.images || [];

      return {
        title: post.title,
        description: post.desc?.substring(0, 160) || "Reseña en Hablar Paja BC",
        openGraph: {
          title: post.title,
          description: post.desc?.substring(0, 160),
          images: [post.image, ...previousImages],
          type: 'article',
          authors: [post.authorName],
          publishedTime: post.createdAt?.toDate().toISOString(),
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Lectura | Hablar Paja BC",
  };
}

export default async function PostPage({ params }: Props) {
  const id = (await params).id;
  return <PostContent id={id} />;
}

