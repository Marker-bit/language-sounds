"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDb } from "@/lib/utils";
import {
  Clipboard,
  ClipboardCheck,
  ClipboardPaste,
  ClipboardX,
  FileDown,
  Files,
  Link,
} from "lucide-react";
import { useState } from "react";

export default function Page() {
  const [done, setDone] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportBlobUrl, setExportBlobUrl] = useState<string | null>(null);
  const [exportData, setExportData] = useState<object | null>(null);
  const [clipboardTestState, setClipboardTestState] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [clipboardDone, setClipboardDone] = useState(false);
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
            const jsonData = {
              words,
              languages,
              pairs,
            };
            const text = JSON.stringify(jsonData);
            const url =
              "data:text/plain;charset=utf-8," + encodeURIComponent(text);
            const blob = new Blob([text], {
              type: "text/plain",
            });
            const url2 = URL.createObjectURL(blob);
            setExportUrl(url);
            setExportBlobUrl(url2);
            setExportData(jsonData);
            // const link = document.createElement("a");
            // link.href = url;
            // link.download = "export.json";
            // document.body.appendChild(link).click();
          };
        };
      };
    });
  }

  function importFromJson(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
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
        resolve();
      });
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
        importFromJson(data).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1000);
        });
      };
    };
  }

  function copyToClipboard(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }

  function exportToClipboard() {
    navigator.clipboard
      .writeText(JSON.stringify(exportData!))
      .then(() => {
        setClipboardTestState("success");
      })
      .catch((err) => {
        console.error("Failed to write to clipboard: ", err);
        setClipboardTestState("error");
      });
  }

  function testClipboard() {
    setClipboardTestState("idle");
    copyToClipboard("test");
    navigator.clipboard
      .readText()
      .then((text) => {
        console.log(text);
        setClipboardTestState(text === "test" ? "success" : "error");
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
        setClipboardTestState("error");
      });
  }

  function importFromClipboard() {
    setClipboardDone(false);
    navigator.clipboard
      .readText()
      .then((text) => {
        const data = JSON.parse(text);
        importFromJson(data).then(() => {
          setClipboardDone(true);
          setTimeout(() => setClipboardDone(false), 1000);
        });
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  }
  return (
    <div className="p-5 flex gap-1 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="max-sm:w-full" onClick={exportFunc}>
            Экспорт
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-sm:w-screen">
          <div className="flex flex-col gap-1">
            {exportUrl && (
              <a href={exportUrl} download="export.json" className="w-full">
                <Button className="w-full">Скачать</Button>
              </a>
            )}
            {exportBlobUrl && (
              <a href={exportBlobUrl} download="export.json" className="w-full">
                <Button className="w-full">Скачать 2</Button>
              </a>
            )}
            <Button onClick={exportToClipboard}>
              <Clipboard className="inline mr-1 w-4 h-4" /> Копировать данные
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button className="max-sm:w-full">Импорт</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-1">
            <Button onClick={importFunc}>
              {done ? (
                <div>
                  <FileDown className="inline mr-1 w-4 h-4 text-green-500" />{" "}
                  Импорт из файла завершен
                </div>
              ) : (
                <div>
                  <Files className="inline mr-1 w-4 h-4" /> Импорт из файла
                </div>
              )}
            </Button>
            <Button onClick={importFromClipboard}>
              {clipboardDone ? (
                <div>
                  <ClipboardCheck className="inline mr-1 w-4 h-4 text-green-500" />{" "}
                  Импорт из буфера обмена завершен
                </div>
              ) : (
                <div>
                  <ClipboardPaste className="inline mr-1 w-4 h-4" /> Импорт из
                  буфера обмена
                </div>
              )}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex gap-1 max-sm:w-full">
        <Button className="max-sm:w-full" onClick={testClipboard}>
          {clipboardTestState === "success" && (
            <div>
              <ClipboardCheck className="text-green-500 inline mr-1 w-4 h-4" />{" "}
              Буфер обмена работает
            </div>
          )}
          {clipboardTestState === "error" && (
            <div>
              <ClipboardX className="text-red-500 inline mr-1 w-4 h-4" /> Буфер
              обмена не работает
            </div>
          )}
          {clipboardTestState === "idle" && (
            <div>
              <Clipboard className="inline mr-1 w-4 h-4" /> Тест буфера обмена
            </div>
          )}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              ?
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>
              Сначала скопируется текст &quot;test&quot; в буфер обмена, затем
              проверится получение текста из буфера (браузер может запросить
              чтение)
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
