"use server";

/**
 * Fetches the title of a Google Drive file by scraping its public preview page.
 * This avoids the need for an API key for public files.
 */
export async function getDriveVideoTitle(fileId: string): Promise<string> {
  try {
    const url = `https://drive.google.com/file/d/${fileId}/view`;
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) return "Video de la Unincca";

    const html = await response.text();
    
    // Extract title from <title> tag or og:title meta tag
    const titleMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/<meta property="og:title" content="(.*?)"/i);
    
    if (titleMatch && titleMatch[1]) {
      let title = titleMatch[1];
      
      // Clean up the title (remove Google Drive suffix and extension if present)
      title = title.replace(/\.mp4 - Google Drive$/i, '')
                   .replace(/ - Google Drive$/i, '')
                   .trim();
                   
      return title || "Video de la Unincca";
    }

    return "Video de la Unincca";
  } catch (error) {
    console.error("Error fetching Drive title:", error);
    return "Video de la Unincca";
  }
}
