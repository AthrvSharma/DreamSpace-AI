import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let isFirebaseInitialized = false;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT.startsWith('{') 
                ? process.env.FIREBASE_SERVICE_ACCOUNT 
                : Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')
        );
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        isFirebaseInitialized = true;
        console.log('✅ Firebase Admin initialized');
    } else {
        console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not found in .env. Google Login is DISABLED.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
}

export const verifyGoogleToken = async (idToken) => {
    if (!isFirebaseInitialized) {
        // SECURITY FIX: Previously this decoded any JWT blindly (mock mode).
        // Now we properly reject when Firebase isn't configured.
        throw new Error('Google login is not configured. Set FIREBASE_SERVICE_ACCOUNT in .env');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
            picture: decodedToken.picture || ''
        };
    } catch (error) {
        console.error('Error verifying Firebase token:', error.message);
        throw new Error('Invalid Google token');
    }
};
