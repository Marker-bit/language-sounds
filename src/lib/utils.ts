import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDb(f: (db: IDBDatabase) => void) {
  let openRequest = indexedDB.open("words", 2);

  openRequest.onupgradeneeded = function () {
    let db = openRequest.result;
    if (!db.objectStoreNames.contains("words")) {
      db.createObjectStore("words", { keyPath: "id", autoIncrement: true });
    }
    if (!db.objectStoreNames.contains("languages")) {
      db.createObjectStore("languages", { keyPath: "id", autoIncrement: true });
    }
    if (!db.objectStoreNames.contains("pairs")) {
      db.createObjectStore("pairs", { keyPath: "id", autoIncrement: true });
    }
  };

  openRequest.onsuccess = function () {
    f(openRequest.result);
  };

  openRequest.onerror = function () {
    console.error("Error opening database:", openRequest.error);
  }
}
