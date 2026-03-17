import * as admin from 'firebase-admin';

/**
 * Initializes Firebase Admin lazily to avoid errors during build time 
 * when environment variables are missing.
 */
function getAdminApp() {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.warn('Firebase Admin environment variables are missing. This is expected during build if no secrets are provided.');
      // Return a proxy or wait for runtime
      throw new Error('Firebase Admin environment variables missing');
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      throw error;
    }
  }
  return admin;
}

export const getAdminDb = () => getAdminApp().firestore();
export const getAdminAuth = () => getAdminApp().auth();
export { admin };
