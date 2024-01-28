"use client";

import AudioPlayback from "@/components/audio-playback";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { getDb } from "@/lib/utils";
import {
  CopyPlus,
  Edit,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Language } from "@/types";

export default function Page() {
  const { languageId } = useParams();
  const [language, setLanguage] = useState<Language | null>(null);
  const [words, setWords] = useState<any[]>([]);
  const { onOpen } = useModal();

  useEffect(() => {
    function update() {
      getDb((db) => {
        let transaction = db.transaction("languages", "readwrite");
        let store = transaction.objectStore("languages");
        store.get(parseInt(languageId as string)).onsuccess = (event: any) => {
          setLanguage(event.target.result);
          const tx = db.transaction("words", "readwrite");
          const store = tx.objectStore("words");
          store.getAll().onsuccess = (event: any) => {
            setWords(
              event.target.result.filter(
                (w: any) => w.languageId === parseInt(languageId as string)
              )
            );
          };
        };
      });
    }
    update();
    setInterval(update, 1000);
  }, [languageId]);

  return (
    <div>
      {!language ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <h1 className="text-3xl font-bold">{language?.title}</h1>
          <Button
            variant="outline"
            onClick={() => onOpen("addWord", language, null, null, words)}
            className="my-2 group"
          >
            <Plus className="transition-all duration-300 w-4 h-4 mr-2 rotate-0 group-hover:rotate-90" /> Добавить слово
          </Button>
          {words.toReversed().map((word) => (
            <div key={word.id} className="flex gap-1 flex-row items-center">
              <AudioPlayback audio={word.audio} />
              <div className="ml-1">{word.word}</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="p-1 rounded-full h-6 w-6 ml-0.5"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => onOpen("editWord", language, word, null)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    <span>Редактировать</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onOpen("deleteWord", language, word, null)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span>Удалить</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
