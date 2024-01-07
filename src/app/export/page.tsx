"use client";

import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/utils";
import { useState } from "react";

export default function Page() {
  const [done, setDone] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  function exportFunc() {
    getDb((db) => {
      const tx = db.transaction("words", "readonly");
      const store = tx.objectStore("words");

      store.getAll().onsuccess = (event: any) => {
        const words = event.target.result;
        const tx = db.transaction("languages", "readonly");
        const store = tx.objectStore("languages");

        store.getAll().onsuccess = (event: any) => {
          const languages = event.target.result;
          const tx = db.transaction("pairs", "readonly");
          const store = tx.objectStore("pairs");

          store.getAll().onsuccess = (event: any) => {
            const pairs = event.target.result;
            const link = document.createElement("a");
            const jsonData = {
              words,
              languages,
              pairs,
            };
            const text = JSON.stringify(jsonData);
            const url =
              "data:text/plain;charset=utf-8," + encodeURIComponent(text);
            setExportUrl(url);
            link.href = url;
            link.download = "export.json";
            document.body.appendChild(link).click();
          };
        };
      };
    });
  }
  function importFunc() {
    setDone(false);
    const input = document.createElement("input");
    input.type = "file";
    input.click();
    input.onchange = (event: any) => {
      const file = event.target!.files[0];
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (event) => {
        const data = JSON.parse(event.target!.result as string);
        console.log(data);
        getDb((db) => {
          let tx = db.transaction("languages", "readwrite");
          let store = tx.objectStore("languages");
          store.clear();
          for (const language of data.languages) {
            store.add(language);
          }
          tx = db.transaction("words", "readwrite");
          store = tx.objectStore("words");
          store.clear();
          for (const word of data.words) {
            store.add(word);
          }
          tx = db.transaction("pairs", "readwrite");
          store = tx.objectStore("pairs");
          store.clear();
          for (const pair of data.pairs) {
            store.add(pair);
          }
          setDone(true);
        });
      };
    };
  }
  return (
    <div className="p-5 flex gap-1">
      <Button onClick={exportFunc}>Экспорт</Button>
      <Button onClick={importFunc}>Импорт</Button>
      {exportUrl && (
        <a href={exportUrl} download="export.json">Скачать</a>
      )}
      {done && <div className="text-green-500">Импорт завершен</div>}
    </div>
  );
}
