import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, browserPopupRedirectResolver } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

let loginInProgress = false;

export const loginWithGoogle = async () => {
  if (loginInProgress) {
    console.warn("Login already in progress");
    return;
  }
  
  loginInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    const user = result.user;
    
    // Create/Update user profile
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'user',
        createdAt: serverTimestamp()
      });
    }
    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      alert("The login popup was blocked by your browser. Please allow popups for this site and try again.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.log("A previous login request was cancelled.");
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.log("Login popup closed by user.");
    } else {
      console.error("Login failed:", error);
    }
    throw error;
  } finally {
    loginInProgress = false;
  }
};

export const logout = () => signOut(auth);

// Error handling helper as per system instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
