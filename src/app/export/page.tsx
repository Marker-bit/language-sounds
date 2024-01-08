"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDb } from "@/lib/utils";
import { randomUUID } from "crypto";
import {
  ArrowDownUp,
  BookA,
  Check,
  Clipboard,
  ClipboardCheck,
  ClipboardPaste,
  ClipboardX,
  Copy,
  FileDown,
  Files,
  Link,
  List,
  Loader2,
  ScrollText,
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
  const [fileName, setFileName] = useState<string>("");
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [fileId, setFileId] = useState<string>("");
  const [importedData, setImportedData] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
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
    // first variant
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    // second variant
    console.log(text);
    navigator.clipboard.writeText(text).then(() => {
      console.log("Text copied to clipboard");
    });
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

  function saveToFileIo() {
    setImportLoading(true);
    let randomUUID = Math.random().toString(36).slice(10);
    const form = new FormData();
    form.append("file", new File([JSON.stringify(exportData!)], "export.json"));

    // fetch("https://0x0.st", {
    //   method: "POST",
    //   body: form,
    //   mode: "no-cors",
    // })
    //   .then((response) => response.text())
    //   .then((text) => {
    //     copyToClipboard(text);
    //   });
    fetch(`/export/send_file/`, {
      method: "POST",
      body: new File([JSON.stringify(exportData!)], "export.json"),
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => response.text())
      .then((text) => {
        const data = JSON.parse(text);
        console.log(data);
        copyToClipboard(data.key);
        setFileId(data.key);
        setImportLoading(false);
      });
  }

  function importFromFileIo() {
    setImportLoading(true);
    fetch(`/export/get_file/?filename=${fileName}`)
      .then((response) => response.text())
      .then((text) => {
        const data = JSON.parse(text);
        console.log(data);
        if (!data || data?.success === false) {
          setImportError("Некорректные данные");
          setImportLoading(false);
          return;
        }
        setImportedData(data);
        setImportLoading(false);
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
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={saveToFileIo} disabled={importLoading}>
                  {importLoading ? (
                    <Loader2 className="inline mr-1 w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowDownUp className="inline mr-1 w-4 h-4" />
                  )}
                  Сохранить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Сохранить</DialogTitle>
                </DialogHeader>
                {importLoading ? (
                  <div className="flex gap-1 items-center justify-center h-80">
                    <Loader2 className="inline mr-1 w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="flex gap-1 flex-col items-center">
                    <div className="flex gap-1 p-1 w-fit border border-zinc-200 rounded items-center">
                      <span>{fileId}</span>
                      <Button
                        onClick={() => copyToClipboard(fileId)}
                        className="p-1 ml-0.5 h-fit"
                        variant="outline"
                      >
                        <Copy className="inline w-4 h-4" />
                      </Button>
                    </div>
                    <p>Эта ссылка будет активной ещё полчаса.</p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
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
            <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <ArrowDownUp className="inline mr-1 w-4 h-4" /> Импорт с
                  сервера
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Импорт с сервера</DialogTitle>
                  <DialogDescription>
                    Импортируйте данные из сервера
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="Имя файла"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
                <Button
                  disabled={!fileName || importLoading}
                  className="w-full"
                  onClick={importFromFileIo}
                >
                  {importLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Импорт
                </Button>
                {importError && (
                  <div className="text-red-500">{importError}</div>
                )}
                {importedData && (
                  <div className="flex gap-1 items-center justify-center">
                    <div>
                      <span>{importedData?.languages?.length}</span>
                      <BookA className="inline ml-1 w-4 h-4" />
                    </div>
                    <div>
                      <span>{importedData?.pairs?.length}</span>
                      <List className="inline ml-1 w-4 h-4" />
                    </div>
                    <div>
                      <span>{importedData?.words?.length}</span>
                      <ScrollText className="inline ml-1 w-4 h-4" />
                    </div>
                    <Button
                      onClick={() => {
                        importFromJson(importedData);
                        setImportModalOpen(false);
                        setImportedData(null);
                      }}
                      size="icon"
                      className="h-fit w-fit p-1 rounded-full"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
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
