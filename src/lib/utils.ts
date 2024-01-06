import { Language } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDb(f: (db: IDBDatabase) => void) {
  let openRequest = indexedDB.open("words", 3);

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
    } else {
      let tsx1 = db.transaction("languages", "readwrite");
      let store1 = tsx1.objectStore("languages");

      store1.getAll().onsuccess = (event: any) => {
        const languages = event.target.result;
        let tsx = db.transaction("pairs", "readwrite");
        let store = tsx.objectStore("pairs");

        store.getAll().onsuccess = (event: any) => {
          for (const pair of event.target.result) {
            store.put({
              id: pair.id,
              fromLanguageId: pair.fromLanguageId,
              toLanguageId: pair.toLanguageId,
              fromLanguage: languages.find((l: Language) => l.id === pair.fromLanguageId),
              toLanguage: languages.find((l: Language) => l.id === pair.toLanguageId),
            });
          }
        };
      };
    }
  };

  openRequest.onsuccess = function () {
    f(openRequest.result);
  };

  openRequest.onerror = function () {
    console.error("Error opening database:", openRequest.error);
  };
}
