import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  SETTINGS: 'settings'
} as const;

// User related operations
export const userService = {
  async createUser(userId: string, userData: DocumentData) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  async getUser(userId: string) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  },

  async updateUser(userId: string, userData: DocumentData) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  }
};

// Project related operations
export const projectService = {
  async createProject(userId: string, projectData: DocumentData) {
    const projectRef = doc(collection(db, COLLECTIONS.PROJECTS));
    await setDoc(projectRef, {
      ...projectData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return projectRef.id;
  },

  async getProject(projectId: string) {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    const projectSnap = await getDoc(projectRef);
    return projectSnap.exists() ? projectSnap.data() : null;
  },

  async getUserProjects(userId: string) {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(
      projectsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async updateProject(projectId: string, projectData: DocumentData) {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
  },

  async deleteProject(projectId: string) {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await deleteDoc(projectRef);
  }
};

// Settings related operations
export const settingsService = {
  async getUserSettings(userId: string) {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
    const settingsSnap = await getDoc(settingsRef);
    return settingsSnap.exists() ? settingsSnap.data() : null;
  },

  async updateUserSettings(userId: string, settingsData: DocumentData) {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
    await setDoc(settingsRef, {
      ...settingsData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
}; 