import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { SEEDED_RESOURCES, SupportResource } from "../data/resources";

const ADMIN_TOKEN = "safemap-admin-auth-secret-token-2026";

// Fallback in-memory cache in case of temporary offline/network issues
let inMemoryResources: SupportResource[] = [...SEEDED_RESOURCES];
let inMemoryPending: any[] = [];
let inMemoryApproved: any[] = [];
let inMemoryChats: { [id: string]: any } = {};

function withTimeout<T>(promise: Promise<T>, ms: number = 3000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Firestore timeout"));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function getResourcesFromFirestore(): Promise<SupportResource[]> {
  try {
    const snapshot = await withTimeout(getDocs(collection(db, "resources")));
    const resources: SupportResource[] = [];
    snapshot.forEach((docSnap) => {
      resources.push(docSnap.data() as SupportResource);
    });

    if (resources.length === 0) {
      seedDefaultResourcesToFirestore().catch(() => {});
      inMemoryResources = [...SEEDED_RESOURCES];
      return SEEDED_RESOURCES;
    }

    inMemoryResources = resources;
    return resources;
  } catch (err) {
    console.warn("Firestore getResources error/timeout, falling back to cache/seed:", err);
    return inMemoryResources;
  }
}

export async function seedDefaultResourcesToFirestore(): Promise<void> {
  try {
    for (const res of SEEDED_RESOURCES) {
      await withTimeout(setDoc(doc(db, "resources", res.id), res), 1500);
    }
  } catch (err) {
    console.warn("Could not seed resources to Firestore:", err);
  }
}

export async function saveResourceToFirestore(resource: SupportResource): Promise<void> {
  if (!resource) return;
  const resId = String(resource.id || "").trim();
  if (!resId) return;

  const index = inMemoryResources.findIndex((r) => r.id === resId);
  if (index !== -1) {
    inMemoryResources[index] = resource;
  } else {
    inMemoryResources.push(resource);
  }

  try {
    await withTimeout(setDoc(doc(db, "resources", resId), resource));
  } catch (err) {
    console.warn("Firestore saveResource error:", err);
  }
}

export async function deleteResourceFromFirestore(id: string): Promise<void> {
  const resId = String(id || "").trim();
  if (!resId) return;
  inMemoryResources = inMemoryResources.filter((r) => r.id !== resId);
  try {
    await withTimeout(deleteDoc(doc(db, "resources", resId)));
  } catch (err) {
    console.warn("Firestore deleteResource error:", err);
  }
}

export async function getPendingSubmissionsFromFirestore(): Promise<any[]> {
  try {
    const snapshot = await withTimeout(getDocs(collection(db, "pendingSubmissions")));
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    inMemoryPending = list;
    return list;
  } catch (err) {
    console.warn("Firestore getPendingSubmissions error/timeout:", err);
    return inMemoryPending;
  }
}

export async function addPendingSubmissionToFirestore(submission: any): Promise<void> {
  if (!submission) return;
  const subId = String(submission.id || "sub_" + Date.now()).trim();
  const sanitized = { ...submission, id: subId };
  inMemoryPending.push(sanitized);
  try {
    await withTimeout(setDoc(doc(db, "pendingSubmissions", subId), sanitized));
  } catch (err) {
    console.warn("Firestore addPendingSubmission error:", err);
  }
}

export async function deletePendingSubmissionFromFirestore(id: string): Promise<void> {
  const subId = String(id || "").trim();
  if (!subId) return;
  inMemoryPending = inMemoryPending.filter((p) => p.id !== subId);
  try {
    await withTimeout(deleteDoc(doc(db, "pendingSubmissions", subId)));
  } catch (err) {
    console.warn("Firestore deletePendingSubmission error:", err);
  }
}

export async function getApprovedHistoryFromFirestore(): Promise<any[]> {
  try {
    const snapshot = await withTimeout(getDocs(collection(db, "approvedHistory")));
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    inMemoryApproved = list;
    return list;
  } catch (err) {
    console.warn("Firestore getApprovedHistory error/timeout:", err);
    return inMemoryApproved;
  }
}

export async function addApprovedHistoryToFirestore(historyItem: any): Promise<void> {
  const id = "hist_" + Math.random().toString(36).substr(2, 9);
  const payload = { ...historyItem, id };
  inMemoryApproved.push(payload);
  try {
    await withTimeout(setDoc(doc(db, "approvedHistory", id), payload));
  } catch (err) {
    console.warn("Firestore addApprovedHistory error:", err);
  }
}

export async function getChatsFromFirestore(): Promise<any[]> {
  try {
    const snapshot = await withTimeout(getDocs(collection(db, "chats")));
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    return list;
  } catch (err) {
    console.warn("Firestore getChats error/timeout:", err);
    return Object.values(inMemoryChats);
  }
}

export async function getChatFromFirestore(sessionId: string): Promise<any | null> {
  const chatId = String(sessionId || "").trim();
  if (!chatId) return null;
  try {
    const docSnap = await withTimeout(getDoc(doc(db, "chats", chatId)));
    if (docSnap.exists()) {
      const data = docSnap.data();
      inMemoryChats[chatId] = data;
      return data;
    }
    return inMemoryChats[chatId] || null;
  } catch (err) {
    console.warn("Firestore getChat error/timeout:", err);
    return inMemoryChats[chatId] || null;
  }
}

export async function saveChatToFirestore(chatSession: any): Promise<void> {
  if (!chatSession) return;
  const chatId = String(chatSession.id || chatSession.sessionId || "").trim();
  if (!chatId) return;

  const sanitized = {
    id: chatId,
    sessionId: chatId,
    messages: (chatSession.messages || []).map((m: any) => ({
      id: String(m.id || "msg_" + Math.random().toString(36).substr(2, 9)),
      role: String(m.role || "user"),
      text: String(m.text || ""),
      timestamp: String(m.timestamp || new Date().toISOString()),
    })),
    needsHuman: Boolean(chatSession.needsHuman),
    updatedAt: String(chatSession.updatedAt || new Date().toISOString()),
  };

  inMemoryChats[chatId] = sanitized;
  try {
    await withTimeout(setDoc(doc(db, "chats", chatId), sanitized));
  } catch (err) {
    console.warn("Firestore saveChat error:", err);
  }
}

export async function getAdminCredentialsFromFirestore(): Promise<{ username: string; password: string; token: string }> {
  const defaultCreds = {
    username: process.env.ADMIN_USERNAME || "ADMINSAFEMAP",
    password: process.env.ADMIN_PASSWORD || "RADEN4EVER",
    token: ADMIN_TOKEN,
  };

  try {
    const docSnap = await withTimeout(getDoc(doc(db, "adminSettings", "credentials")), 2000);
    if (docSnap.exists()) {
      const data = docSnap.data() as { username: string; password: string; token: string };
      return {
        username: data.username || defaultCreds.username,
        password: data.password || defaultCreds.password,
        token: data.token || defaultCreds.token,
      };
    } else {
      // First time: seed credentials to Firestore
      setDoc(doc(db, "adminSettings", "credentials"), defaultCreds).catch(() => {});
      return defaultCreds;
    }
  } catch (err) {
    console.warn("Firestore getAdminCredentials error/timeout, using default credentials:", err);
    return defaultCreds;
  }
}

export async function saveAdminCredentialsToFirestore(username: string, password: string): Promise<void> {
  try {
    await withTimeout(
      setDoc(doc(db, "adminSettings", "credentials"), {
        username,
        password,
        token: ADMIN_TOKEN,
      })
    );
  } catch (err) {
    console.warn("Firestore saveAdminCredentials error:", err);
  }
}
