import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

/**
 * Converts a standard Google Drive share link to a direct download link.
 */
function getDirectDownloadUrl(url: string) {
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
    if (idMatch && idMatch[1]) {
      return `https://docs.google.com/uc?export=download&id=${idMatch[1]}`;
    }
  }
  return url;
}

/**
 * Sends a book to the user's email with a vibrant, inclusive, and fun design.
 */
export async function sendBookEmail(toEmail: string, bookTitle: string, bookAuthor: string, downloadUrl: string) {
  if (!gmailUser || !gmailPass) {
    console.warn("Gmail credentials missing. Email not sent.");
    return { success: false, error: "Configuración de correo incompleta. Contacte al administrador." };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
    pool: true,
    maxConnections: 1,
    maxMessages: Infinity,
  });

  // Prepare attachments with size check
  const attachments = [];
  let isTooLarge = false;
  let fileSize = 0;

  try {
    const directUrl = getDirectDownloadUrl(downloadUrl);
    const response = await fetch(directUrl);
    
    if (response.ok) {
      const contentLength = response.headers.get('content-length');
      fileSize = contentLength ? parseInt(contentLength, 10) : 0;
      const MAX_SIZE = 10 * 1024 * 1024; 
      
      if (fileSize > 0 && fileSize <= MAX_SIZE) {
        attachments.push({
          filename: `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
          content: Buffer.from(await response.arrayBuffer()),
        });
      } else if (fileSize > MAX_SIZE) {
        isTooLarge = true;
      }
    }
  } catch (error) {
    console.error("Error processing file for attachment:", error);
  }

  const mailOptions = {
    from: `"Hablar Paja BC" <${gmailUser}>`,
    to: toEmail,
    subject: `🌈 ¡Llegó tu lectura, para todes!: ${bookTitle}`,
    attachments,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@700&family=Outfit:wght@400;600;800&display=swap');
            body { margin: 0; padding: 0; background-color: #f0f2f5; font-family: 'Outfit', system-ui, sans-serif; }
            .wrapper { width: 100%; table-layout: fixed; background: linear-gradient(135deg, #f0f2f5 0%, #e6e9f0 100%); padding: 60px 0; }
            .main-card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 48px; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.8); }
            
            .vibrant-header { 
              padding: 50px 40px; 
              text-align: center; 
              background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
              color: white;
            }
            .logo-badge { 
              background: rgba(255,255,255,0.2); 
              padding: 12px 24px; 
              border-radius: 100px; 
              display: inline-block;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255,255,255,0.3);
              margin-bottom: 20px;
            }
            .logo-text { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
            
            .content { padding: 60px 50px; text-align: center; }
            .hero-title { font-size: 38px; font-weight: 800; color: #1a1a1a; margin-bottom: 24px; line-height: 1.1; letter-spacing: -0.03em; }
            .hero-sub { font-size: 18px; color: #4a5568; line-height: 1.6; margin-bottom: 40px; }
            
            .book-display { 
              background: #f8fafc;
              border-radius: 40px;
              padding: 48px;
              margin-bottom: 48px;
              border: 2px solid #edf2f7;
              position: relative;
              overflow: hidden;
            }
            .book-display::before {
              content: '';
              position: absolute;
              top: 0; left: 0; width: 8px; height: 100%;
              background: #25D366;
            }
            .tag { 
              font-size: 11px; 
              font-weight: 800; 
              text-transform: uppercase; 
              letter-spacing: 0.2em; 
              color: #25D366; 
              margin-bottom: 16px; 
              display: block; 
            }
            .book-title { font-size: 28px; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; line-height: 1.2; }
            .book-author { font-size: 16px; color: #718096; font-weight: 600; margin-bottom: 32px; }
            
            .quote-box {
              background: white;
              padding: 24px;
              border-radius: 24px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.03);
              margin-bottom: 32px;
            }
            .quote-text { font-family: 'Crimson Pro', serif; font-size: 18px; color: #2d3748; font-style: italic; line-height: 1.5; margin: 0; }
            
            .btn { 
              background: #25D366; 
              color: white !important; 
              padding: 22px 48px; 
              border-radius: 24px; 
              text-decoration: none; 
              font-weight: 800; 
              font-size: 17px; 
              display: inline-block; 
              box-shadow: 0 20px 40px rgba(37, 211, 102, 0.3);
              transition: transform 0.3s;
            }
            
            .inclusive-banner { 
              background: linear-gradient(90deg, #FF0000 0%, #FF7F00 16%, #FFFF00 33%, #00FF00 50%, #0000FF 66%, #4B0082 83%, #8F00FF 100%);
              height: 4px; border: 0; margin: 60px 0 40px 0; border-radius: 2px; opacity: 0.3;
            }
            
            .whatsapp-card { 
              background: #e7f9ee; 
              border-radius: 32px; 
              padding: 40px; 
              text-align: center;
              border: 1px solid #d1fae5;
            }
            .whatsapp-title { font-size: 20px; font-weight: 800; color: #065f46; margin-bottom: 12px; }
            .whatsapp-p { color: #065f46; font-size: 16px; line-height: 1.6; margin-bottom: 24px; opacity: 0.8; }
            
            .footer { padding: 60px 50px; text-align: center; background-color: #fafbfc; }
            .social-links { margin-bottom: 32px; }
            .social-a { 
              background: white; 
              color: #1a1a1a; 
              text-decoration: none; 
              font-weight: 800; 
              font-size: 12px; 
              padding: 10px 20px; 
              border-radius: 100px; 
              border: 1px solid #edf2f7;
              margin: 0 5px;
            }
            .footer-credit { font-size: 12px; color: #94a3b8; font-weight: 600; line-height: 1.8; text-transform: uppercase; letter-spacing: 0.1em; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="main-card">
              <div class="vibrant-header">
                <div class="logo-badge">
                  <p class="logo-text">Hablar Paja BC</p>
                </div>
                <p style="margin:0; font-weight:700; opacity:0.9; font-size:14px; text-transform:uppercase; letter-spacing:0.1em;">El Club de Todas, Todes y Todos</p>
              </div>
              
              <div class="content">
                <h1 class="hero-title">¡Algo vibrante para leer!</h1>
                <p class="hero-sub">En Hablar Paja BC sabemos que siempre es buen momento para una buena pajita, ¡para todes les chiques del club!</p>
                
                <p style="color: #4a5568; font-size: 17px; line-height: 1.7; margin-bottom: 40px; font-weight: 600; font-style: italic;">
                  A veces a solas, para perderse entre páginas...<br/>
                  A veces en grupo, porque hablar paja juntes siempre tiene su encanto.
                </p>

                <div class="book-display">
                  <span class="tag">Lectura del momento</span>
                  <p class="book-title">${bookTitle}</p>
                  <p class="book-author">por ${bookAuthor}</p>
                  
                  <div class="quote-box">
                    <p class="quote-text">
                      "Un libro que entra suave… pero poco a poco te va apretando la cabeza hasta hacerte pensar más de la cuenta."
                    </p>
                  </div>
                  
                  <p style="color: #718096; font-size: 15px; margin-bottom: 32px; line-height: 1.6;">
                    De eses que une empieza por curiosidad y termina sin querer parar. ¡Disfrútale!
                  </p>
                  
                  ${attachments.length > 0 ? `
                    <div style="background: #25D366; color: white; padding: 14px 28px; border-radius: 16px; font-weight: 800; font-size: 14px; display: inline-block;">
                      ✅ PDF ADJUNTO AQUÍ ABAJO
                    </div>
                  ` : `
                    <a href="${downloadUrl}" class="btn">Obtener mi edición ahora</a>
                  `}
                </div>

                <div class="whatsapp-card">
                  <p class="whatsapp-title">¿Quieres comentarlo con nosotres?</p>
                  <p class="whatsapp-p">
                    En Hablar Paja BC creemos que para todo hay un tipo de pajita:<br/>
                    <strong>pajitas a solas</strong>, cuando quieres tomarte tu tiempo<br/>
                    <strong>pajitas compartidas</strong>, cuando las ideas empiezan a fluir<br/>
                    <strong>y pajitas literarias intensas</strong>, de esas que te dejan la cabeza dando vueltas
                  </p>
                  
                  <p style="color: #065f46; font-size: 14px; margin-bottom: 24px; font-style: italic; opacity: 0.7; font-weight: 600;">
                    El ritmo lo pones tú. Suave, lento… o rápido y salvaje.<br/>
                    Nosotres solo ponemos los libros y la conversación.
                  </p>
                  
                  <a href="https://chat.whatsapp.com/G99jS3ldw8pBwmZ3VD56Ah" class="btn" style="background-color: #065f46; box-shadow: 0 10px 25px rgba(6, 95, 70, 0.25);">¡Unirme al grupo ya!</a>
                </div>

                <hr class="inclusive-banner">
              </div>

              <div class="footer">
                <div class="social-links">
                  <a href="https://www.instagram.com/hablarpajabc/" class="social-a">Instagram</a>
                  <a href="https://open.spotify.com/show/6LmAr5N4dbJst2AoZamjKQ" class="social-a">Spotify</a>
                  <a href="https://www.youtube.com/@hablarpajabc05" class="social-a">YouTube</a>
                </div>
                <p class="footer-credit">
                  © 2026 HABLAR PAJA BOOK CLUB<br/>
                  HECHO CON CARIÑO, CAFÉ Y MUCHES PAJITES LITERARIES. 🌈
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Error al enviar el correo." };
  }
}

/**
 * Sends a notification email about account suspension.
 */
export async function sendBanEmail(toEmail: string, userName: string, durationLabel: string, reason: string) {
  if (!gmailUser || !gmailPass) {
    console.warn("Gmail credentials missing. Email not sent.");
    return { success: false, error: "Configuración de correo incompleta." };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  const isPermanent = durationLabel.toLowerCase() === 'permanente';
  
  const mailOptions = {
    from: `"Hablar Paja BC" <${gmailUser}>`,
    to: toEmail,
    subject: isPermanent 
      ? `🛑 Aviso Importante: Suspensión de cuenta - Hablar Paja BC`
      : `⚠️ Suspensión temporal de cuenta - Hablar Paja BC`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Outfit', sans-serif; }
            .card { max-width: 600px; margin: 40px auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #edf2f7; }
            .header { padding: 40px; background: #1a1a1a; color: white; text-align: center; }
            .content { padding: 48px; }
            .title { font-size: 24px; font-weight: 800; color: #1a1a1a; margin-bottom: 24px; }
            .info-box { background: #fff5f5; border: 1px solid #fed7d7; padding: 24px; border-radius: 20px; color: #c53030; margin: 32px 0; }
            .reason-box { background: #f8fafc; border-left: 4px solid #1a1a1a; padding: 20px; border-radius: 12px; font-style: italic; color: #4a5568; margin-bottom: 32px; }
            .footer { padding: 40px; text-align: center; background: #fafbfc; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2 style="margin:0; letter-spacing: -0.02em;">Hablar Paja BC</h2>
            </div>
            <div class="content">
              <h1 class="title">Hola, ${userName}</h1>
              <p>Te informamos que tu cuenta ha sido suspendida debido al siguiente motivo:</p>
              
              <div class="reason-box">
                "${reason}"
              </div>

              <div class="info-box">
                <p style="margin:0; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #9b2c2c; margin-bottom: 8px;">Estado de la cuenta</p>
                <p style="margin:0; font-size: 18px; font-weight: 600;">Suspensión: ${durationLabel}</p>
              </div>

              <p>Durante este periodo no podrás comentar en los posts ni acceder a las funciones exclusivas del Club.</p>
              
              <p style="color: #718096; margin-top: 32px; font-size: 14px;">
                Si crees que esto es un error o deseas apelar la decisión, por favor responde a este correo.
              </p>
            </div>
            <div class="footer">
              © 2026 Hablar Paja BC • Comunidad Literaria
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending ban email:", error);
    return { success: false };
  }
}

/**
 * Sends a notification email about account restoration.
 */
export async function sendUnbanEmail(toEmail: string, userName: string) {
  if (!gmailUser || !gmailPass) {
    console.warn("Gmail credentials missing. Email not sent.");
    return { success: false, error: "Configuración de correo incompleta." };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  const mailOptions = {
    from: `"Hablar Paja BC" <${gmailUser}>`,
    to: toEmail,
    subject: `✨ ¡Buenas noticias! Tu cuenta ha sido restaurada - Hablar Paja BC`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            body { margin: 0; padding: 0; background-color: #f0fdf4; font-family: 'Outfit', sans-serif; }
            .card { max-width: 600px; margin: 40px auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #dcfce7; }
            .header { padding: 40px; background: #22c55e; color: white; text-align: center; }
            .content { padding: 48px; }
            .title { font-size: 24px; font-weight: 800; color: #1a1a1a; margin-bottom: 24px; }
            .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 24px; border-radius: 20px; color: #166534; margin: 32px 0; }
            .footer { padding: 40px; text-align: center; background: #fafbfc; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2 style="margin:0; letter-spacing: -0.02em;">Hablar Paja BC</h2>
            </div>
            <div class="content">
              <h1 class="title">¡Hola de nuevo, ${userName}! 🌈</h1>
              <p>Nos alegra informarte que tu acceso al Club ha sido restaurado con éxito.</p>
              
              <div class="success-box">
                <p style="margin:0; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #166534; margin-bottom: 8px;">Estado de la cuenta</p>
                <p style="margin:0; font-size: 18px; font-weight: 600;">✅ Activa y lista para participar</p>
              </div>

              <p>Ya puedes volver a comentar en los posts, participar en los debates y disfrutar de todas las ventajas de ser parte de nuestra comunidad.</p>
              
              <p>Te esperamos para seguir hablando paja (de la buena) sobre libros.</p>

              <div style="margin-top: 40px; text-align: center;">
                <a href="https://hablarpajabc.com" style="background: #22c55e; color: white; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: 800; display: inline-block;">Volver al Club</a>
              </div>
            </div>
            <div class="footer">
              © 2026 Hablar Paja BC • Lecturas Compartidas
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending unban email:", error);
    return { success: false };
  }
}
