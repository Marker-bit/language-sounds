"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModal } from "@/hooks/use-modal-store";
import { getDb } from "@/lib/utils";
import { Deck } from "@/types";
import {
  ArrowLeftRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Decks() {
  const { onOpen } = useModal();
  const [decks, setDecks] = useState([]);
  const router = useRouter();

  function listDecks() {
    getDb((db) => {
      let transaction = db.transaction("pairs", "readwrite");
      let store = transaction.objectStore("pairs");
      store.getAll().onsuccess = (event: any) => {
        setDecks(event.target.result);
      };
    });
  }
  useEffect(() => {
    listDecks();
    setInterval(listDecks, 100);
  }, []);

  return (
    <div className="flex gap-2 flex-wrap p-2">
      {decks.map((deck: Deck) => (
        <DropdownMenu key={deck.id}>
          <div
            className="border border-zinc-100 rounded-md p-2 hover:border-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
            onClick={() => router.push(`/decks/${deck.id}`)}
          >
            <div className="flex flex-col">
              <span>{deck.title || "Без названия"}</span>
              <span className="text-xs text-zinc-400">
                {deck.pairs.length}{" "}
                <ArrowLeftRight className="w-4 h-4 inline" />
              </span>
              <span className="text-xs text-zinc-400">
                {deck?.fromLanguage?.title} — {deck?.toLanguage?.title}
              </span>
            </div>
          </div>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => onOpen("editDeck", null, null, deck)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onOpen("deleteDeck", null, null, deck)}
            >
              <Trash className="w-4 h-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
      <div
        role="button"
        className="border border-zinc-100 rounded-md p-2 hover:border-zinc-200 transition-colors cursor-pointer flex items-center justify-center"
        onClick={() => onOpen("addDeck", null, null, null)}
      >
        <div>
          <Plus className="w-4 h-4 mr-1 inline" /> Добавить
        </div>
      </div>
    </div>
  );
}
