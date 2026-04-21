import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTzRawFM2fGY5k9dIGd4zwkRCBaJaRII4",
  authDomain: "backvandee.firebaseapp.com",
  projectId: "backvandee",
  storageBucket: "backvandee.firebasestorage.app",
  messagingSenderId: "341505481365",
  appId: "1:341505481365:web:d9ad68b5c6a87d73f9599c",
  measurementId: "G-WCNET3MYX7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* ─── ORDERS ─── */
export async function fbGetOrders() {
  try {
    const q = query(collection(db, "orders"), orderBy("ts", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch {
    return null;
  }
}

export async function fbUpsertOrder(order) {
  try {
    await setDoc(doc(db, "orders", order.id), order, { merge: true });
  } catch {}
}

export async function fbDeleteOrder(id) {
  try {
    await deleteDoc(doc(db, "orders", id));
  } catch {}
}

/* ─── SETTINGS ─── */
export async function fbGetSetting(key) {
  try {
    const snap = await getDoc(doc(db, "settings", key));
    return snap.exists() ? snap.data().value : null;
  } catch {
    return null;
  }
}

export async function fbSetSetting(key, value) {
  try {
    await setDoc(doc(db, "settings", key), { value }, { merge: true });
  } catch {}
}

/* ─── PRODUCTS ─── */
export async function fbGetProducts() {
  try {
    const snap = await getDoc(doc(db, "settings", "products_main"));
    return snap.exists() ? snap.data().value : null;
  } catch {
    return null;
  }
}

export async function fbSetProducts(data) {
  try {
    await setDoc(doc(db, "settings", "products_main"), { value: data }, { merge: true });
  } catch {}
}

/* ─── REAL-TIME LISTENER ─── */
export function fbOnOrders(callback) {
  const q = query(collection(db, "orders"), orderBy("ts", "desc"));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => d.data());
    callback(orders);
  });
}

/* ─── EXPENSES REAL-TIME LISTENER ─── */
export function fbOnExpenses(callback) {
  return onSnapshot(doc(db, "settings", "expenses"), (snap) => {
    if (snap.exists()) {
      const val = snap.data().value;
      callback(Array.isArray(val) ? val : []);
    } else {
      callback([]);
    }
  });
}

/* ─── EXPENSE CATEGORIES REAL-TIME LISTENER ─── */
export function fbOnExpenseCats(callback) {
  return onSnapshot(doc(db, "settings", "expenseCats"), (snap) => {
    if (snap.exists()) {
      const val = snap.data().value;
      callback(Array.isArray(val) ? val : []);
    }
  });
}

/* ─── PRODUCTS REAL-TIME ─── */
export function fbOnProducts(callback) {
  return onSnapshot(doc(db, "settings", "products_main"), (snap) => {
    if (snap.exists()) {
      const val = snap.data().value;
      callback(Array.isArray(val) ? val : []);
    }
  });
}

/* ─── CATEGORIES REAL-TIME ─── */
export function fbOnCategories(callback) {
  return onSnapshot(doc(db, "settings", "categories"), (snap) => {
    if (snap.exists()) {
      const val = snap.data().value;
      callback(Array.isArray(val) ? val : []);
    }
  });
}

/* ─── SHIPPING REAL-TIME ─── */
export function fbOnShipping(callback) {
  return onSnapshot(doc(db, "settings", "shipping"), (snap) => {
    if (snap.exists()) {
      const val = snap.data().value;
      callback(Array.isArray(val) ? val : []);
    }
  });
}

/* ─── LOTS REAL-TIME ─── */
export function fbOnLots(callback) {
  return onSnapshot(doc(db, "settings", "lots"), (snap) => {
    if (snap.exists()) {
      const val = snap.data().value;
      callback(Array.isArray(val) ? val : []);
    } else {
      callback([]);
    }
  });
}
