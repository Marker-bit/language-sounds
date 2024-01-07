"use client";

import { EditLanguageModal } from "@/components/dialogs/edit-language";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal-store";
import { getDb } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  let [languages, setLanguages] = useState([]);
  let [title, setTitle] = useState("");
  let [mounted, setMounted] = useState(false);
  const {onOpen} = useModal();

  useEffect(() => {
    setMounted(true);
    update();
    setInterval(update, 1000);
  }, []);

  function update() {
    getDb((db) => {
      let transaction = db.transaction("languages", "readwrite");
      let store = transaction.objectStore("languages");
      store.getAll().onsuccess = (event: any) => {
        setLanguages(event.target.result);
      };
    });
  }

  function addLanguage() {
    getDb((db) => {
      let transaction = db.transaction("languages", "readwrite");
      let store = transaction.objectStore("languages");
      store.add({ title });
    });
  }

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        {languages.map((language: { id: number; title: string }) => (
          <ContextMenu key={language.id}>
            <ContextMenuTrigger>
              <Link href={`/languages/${language.id}`}>
                <div className="border border-zinc-200 rounded-md p-2 py-1 cursor-pointer">
                  {language.title}
                </div>
              </Link>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onOpen("editLanguage", language, null, null)}>
                <Pencil className="w-4 h-4 mr-1" />
                <span>Редактировать</span>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onOpen("deleteLanguage", language, null, null)}>
                <Trash2 className="w-4 h-4 mr-1" />
                <span>Удалить</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      <Dialog>
        <DialogTrigger>
          <Button
            className="border border-zinc-200 rounded-md p-1 my-2"
            variant="outline"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="mb-2">
            <DialogTitle>Добавить язык</DialogTitle>
          </DialogHeader>
          <Label htmlFor="name">Название языка</Label>
          <Input
            id="name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={addLanguage}>Добавить</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
