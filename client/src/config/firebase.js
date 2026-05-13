import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBNywSp7hT67rHrZx-197utq7O9nmekTSk",
    authDomain: "dreamspace-621c2.firebaseapp.com",
    projectId: "dreamspace-621c2",
    storageBucket: "dreamspace-621c2.firebasestorage.app",
    messagingSenderId: "641386200564",
    appId: "1:641386200564:web:74ac3f3a2d1ac7c9d98da1",
    measurementId: "G-C78ZL2TW0K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const token = result.user.accessToken;
        return { user: result.user, token };
    } catch (error) {
        console.error("Firebase Google Sign-In Error:", error);
        throw error;
    }
};
