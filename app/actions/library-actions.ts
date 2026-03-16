"use server";

import { sendBookEmail } from "@/lib/email";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export async function requestBookEmail(email: string, bookTitle: string, bookAuthor: string, downloadUrl: string) {
  if (!email) {
    return { success: false, error: "No se proporcionó un correo electrónico." };
  }

  return await sendBookEmail(email, bookTitle, bookAuthor, downloadUrl);
}

export async function incrementDownloadCount(bookId: string) {
  console.log(">>> [SERVER ACTION] incrementDownloadCount triggered for:", bookId);
  try {
    if (!db) {
      console.error(">>> [SERVER ACTION] Database not initialized!");
      throw new Error("Database not initialized");
    }
    const bookRef = doc(db, "library", bookId);
    console.log(">>> [SERVER ACTION] Updating document...");
    await updateDoc(bookRef, {
      downloadCount: increment(1)
    });
    console.log(">>> [SERVER ACTION] Update successful!");
    return { success: true };
  } catch (error) {
    console.error(">>> [SERVER ACTION] Error incrementing download count:", error);
    return { success: false, error: String(error) };
  }
}
