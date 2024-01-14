"use client";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useModal } from "@/hooks/use-modal-store";
import { getDb } from "@/lib/utils";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  let [languages, setLanguages] = useState([]);
  let [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { onOpen } = useModal();

  useEffect(() => {
    setMounted(true);
    update();
    setLoading(false);
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

  if (!mounted) {
    return null;
  }

  return (
    <div>
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
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
              <ContextMenuItem
                onClick={() => onOpen("editLanguage", language, null, null)}
              >
                <Pencil className="w-4 h-4 mr-1" />
                <span>Редактировать</span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onOpen("deleteLanguage", language, null, null)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                <span>Удалить</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        {!loading && (
          <Button
            className="border border-zinc-200 rounded-md w-20"
            variant="outline"
            onClick={() => onOpen("addLanguage", null, null, null)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
