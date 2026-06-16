import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseApp } from "./firebase";

const USERS_KEY = 'trx_users';
const COUNTS_KEY = 'trx_pred_counts';
const HISTORY_KEY = 'trx_unlimited_history';

function getDb() {
  return getFirestore(getFirebaseApp());
}

export function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUser(user) {
  const users = getUsers();
  if (!users.find(u => u.email === user.email)) {
    const newUser = {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      unlimited: false,
      unlimitedAt: null,
      createdAt: Date.now(),
    };
    users.push(newUser);
    saveUsers(users);
    syncUserToDB(newUser);
    syncUserToFirestore(newUser);
  }
  return users;
}

function syncUserToDB(user) {
  fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, displayName: user.displayName, photoURL: user.photoURL }),
  }).catch(() => {});
}

async function syncUserToFirestore(user) {
  try {
    const db = getDb();
    const usersRef = collection(db, "admin_users");
    const q = query(usersRef, where("email", "==", user.email));
    const snap = await getDocs(q);
    if (snap.empty) {
      await addDoc(usersRef, {
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        unlimited: false,
        unlimitedAt: null,
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("Firestore sync error:", err);
  }
}

async function checkFirestoreUnlimited(email) {
  try {
    const db = getDb();
    const usersRef = collection(db, "admin_users");
    const q = query(usersRef, where("email", "==", email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data().unlimited === true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function setUnlimited(email, value) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (user) {
    user.unlimited = value;
    user.unlimitedAt = value ? Date.now() : null;
    saveUsers(users);
    if (value) addUnlimitedHistory(email);
    return true;
  }
  return false;
}

export async function isUnlimited(email) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (user?.unlimited) return true;
  return checkFirestoreUnlimited(email);
}

function getDailyKey(email) {
  const d = new Date();
  return `${email}_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function getPredictionCount(email) {
  try {
    const data = JSON.parse(localStorage.getItem(COUNTS_KEY) || '{}');
    return data[getDailyKey(email)] || 0;
  } catch { return 0; }
}

export function incrementPredictionCount(email) {
  const data = JSON.parse(localStorage.getItem(COUNTS_KEY) || '{}');
  const key = getDailyKey(email);
  data[key] = (data[key] || 0) + 1;
  localStorage.setItem(COUNTS_KEY, JSON.stringify(data));
  return data[key];
}

export async function getRemainingPredictions(email) {
  if (await isUnlimited(email)) return -1;
  return Math.max(0, 5 - getPredictionCount(email));
}

export function getUnlimitedHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function addUnlimitedHistory(email) {
  const history = getUnlimitedHistory();
  history.push({ email, activatedAt: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
