import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Ensure auth persists across page loads (required for redirect-based login)
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Handle the result of a redirect-based Google sign-in.
// This runs on every page load and completes the login if the user was redirected back.
getRedirectResult(auth).then(async (result) => {
  if (!result) return;
  const user = result.user;
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || user.email || 'User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        role: 'user',
        createdAt: serverTimestamp()
      });
    }
  } catch (dbErr) {
    console.warn('Could not sync user profile to Firestore after redirect:', dbErr);
  }
}).catch((error) => {
  console.error('Redirect sign-in result error:', error);
});

// Test Firestore connection on boot as per Firebase guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'presentation', 'active'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
    return false;
  }
}
testFirestoreConnection();

let loginInProgress = false;

export const loginWithGoogle = async () => {
  if (loginInProgress) {
    console.warn("Login already in progress");
    return;
  }

  loginInProgress = true;
  try {
    // Try popup first — works in standard browsers
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create/Update user profile safely
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName || user.email || 'User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
    } catch (dbErr) {
      console.warn("Could not sync user profile to Firestore:", dbErr);
    }
    return user;
  } catch (error: any) {
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      // Popup unavailable — fall back to full-page redirect login
      console.warn('Popup sign-in unavailable, falling back to redirect:', error.code);
      try {
        await signInWithRedirect(auth, googleProvider);
        // Page will redirect — execution stops here
      } catch (redirectError: any) {
        console.error('Redirect sign-in also failed:', redirectError);
        throw redirectError;
      }
    } else {
      console.error("Login failed:", error);
      throw error;
    }
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
