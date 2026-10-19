import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  getDocFromServer,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { SavedDraft } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Initialize Firestore with specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Infrastructure
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
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
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection verification
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently running offline or connection is initializing.');
    }
  }
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error: any) {
    // If the user dismissed or closed the sign-in popup, handle gracefully without error
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      return null;
    }
    console.error('Google login error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

// User Profile Sync
export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        userId: user.uid,
        displayName: (user.displayName || 'User').slice(0, 100),
        email: (user.email || '').slice(0, 150),
        photoURL: (user.photoURL || '').slice(0, 1000),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Firestore Resume Storage Operations
export async function saveResumeToCloud(
  userId: string,
  draft: SavedDraft
): Promise<void> {
  // Normalize ID for Firestore valid ID regex ^[a-zA-Z0-9_\-]+$
  const safeId = draft.id.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 120);
  const path = `users/${userId}/resumes/${safeId}`;

  const payload = {
    userId,
    title: (draft.title || 'Untitled Draft').slice(0, 200),
    templateId: String(draft.templateId || 1).slice(0, 50),
    theme: (draft.theme?.id || 'classic-navy').slice(0, 50),
    photo: draft.photo?.photoUrl ? draft.photo.photoUrl.slice(0, 1900000) : '',
    docData: JSON.stringify(draft.docData).slice(0, 490000),
    typography: JSON.stringify(draft.typography).slice(0, 9500),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'users', userId, 'resumes', safeId);
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getResumesFromCloud(userId: string): Promise<SavedDraft[]> {
  const path = `users/${userId}/resumes`;
  try {
    const q = query(collection(db, 'users', userId, 'resumes'));
    const snapshot = await getDocs(q);
    const drafts: SavedDraft[] = [];

    snapshot.forEach((d) => {
      const data = d.data();
      try {
        const parsedDocData = typeof data.docData === 'string' ? JSON.parse(data.docData) : data.docData;
        const parsedTypography =
          typeof data.typography === 'string' && data.typography ? JSON.parse(data.typography) : undefined;

        drafts.push({
          id: d.id,
          title: data.title || 'Saved Resume',
          updatedAt: data.updatedAt
            ? new Date(data.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Cloud Draft',
          docData: parsedDocData,
          templateId: Number(data.templateId) || 1,
          theme: {
            id: data.theme || 'classic-navy',
            name: data.theme || 'Theme',
            primary: '#1e3a8a',
            secondary: '#3b82f6',
            headingColor: '#1e3a8a',
            accent: '#60a5fa',
            bgDarkBadge: '#1e3a8a',
          },
          photo: {
            showPhoto: Boolean(data.photo),
            photoUrl: data.photo || null,
            topOffset: 0,
            leftOffset: 0,
            scale: 100,
            frameWidth: 100,
            frameHeight: 120,
            shape: 'rounded',
            borderWidth: 2,
            borderColor: '#e2e8f0',
            shadow: true,
          },
          typography: parsedTypography,
        });
      } catch (parseErr) {
        console.warn('Error parsing cloud resume payload:', parseErr);
      }
    });

    return drafts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteResumeFromCloud(userId: string, resumeId: string): Promise<void> {
  const safeId = resumeId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}/resumes/${safeId}`;
  try {
    const docRef = doc(db, 'users', userId, 'resumes', safeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
