"use server";

import { sendBookEmail } from "@/lib/email";

export async function requestBookEmail(email: string, bookTitle: string, bookAuthor: string, downloadUrl: string) {
  if (!email) {
    return { success: false, error: "No se proporcionó un correo electrónico." };
  }

  return await sendBookEmail(email, bookTitle, bookAuthor, downloadUrl);
}
