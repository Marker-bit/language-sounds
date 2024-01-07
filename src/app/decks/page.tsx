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
import { MoreHorizontal, Pencil, Plus } from "lucide-react";
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
      {decks.map((deck: any) => (
        <DropdownMenu key={deck.id}>
          <div
            className="border border-zinc-100 rounded-md p-2 hover:border-zinc-200 transition-colors flex items-center gap-1"
            onClick={() => router.push(`/decks/${deck.id}`)}
          >
            <span>{deck.title || "Без названия"}</span>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full p-1 h-auto">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => onOpen("editDeck", null, null, deck)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Редактировать
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
      <div
        role="button"
        className="border border-zinc-100 rounded-md p-2 hover:border-zinc-200 transition-colors cursor-pointer"
        onClick={() => onOpen("addDeck", null, null, null)}
      >
        <Plus className="w-4 h-4 mr-1 inline" /> Добавить
      </div>
    </div>
  );
}
