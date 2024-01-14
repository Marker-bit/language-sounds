"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Word } from "@/types";
import { Plus, ChevronLeft, ChevronRight, Search, Check } from "lucide-react";
import { useEffect, useState } from "react";

const AddPair = ({
  words,
  words2,
  doneFunc,
  open,
  setOpen,
}: {
  words: Word[];
  words2: Word[];
  doneFunc: (selected1: number, selected2: number) => any;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [search, setSearch] = useState("");
  const [checked1, setChecked1] = useState<number | null>(null);
  const [checked2, setChecked2] = useState<number | null>(null);
  const [current, setCurrent] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return;
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-20">
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-sm:h-full">
        <DialogHeader>
          <DialogTitle>Добавить пару</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-fit w-fit p-1"
            disabled={current === 0}
            onClick={() => setCurrent((current) => current - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span>{current + 1} / 2</span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-fit w-fit p-1"
            disabled={current === 1}
            onClick={() => setCurrent((current) => current + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <p>
          {words.find(({ id }) => id === checked1)?.word || "?"} —{" "}
          {words2.find(({ id }) => id === checked2)?.word || "?"}
        </p>
        <div className="flex items-center gap-2 border border-zinc-200 p-2 rounded-md">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            className="outline-none h-full w-full"
            value={search}
            onChange={(evt) => setSearch(evt.target.value)}
          />
        </div>
        {current === 0 && (
          <ScrollArea className="flex flex-col h-[50vh]">
            {words
              .filter(({ word }) => word.includes(search))
              .toReversed()
              .map(({ word, id }) => (
                <div
                  key={id}
                  className="border border-zinc-200 hover:border-zinc-300 cursor-pointer p-2 rounded-md flex items-center mb-2 group"
                  onClick={() => setChecked1(id)}
                >
                  <Check
                    className={cn(
                      "w-4 h-4 mr-2 text-zinc-300 group-hover:text-zinc-700 transition-all",
                      checked1 === id && "text-zinc-700"
                    )}
                  />
                  {word}
                </div>
              ))}
          </ScrollArea>
        )}
        {current === 1 && (
          <ScrollArea className="flex flex-col h-[50vh]">
            {words2
              .filter(({ word }) => word.includes(search))
              .toReversed()
              .map(({ word, id }) => (
                <div
                  key={id}
                  className="border border-zinc-200 hover:border-zinc-300 cursor-pointer p-2 rounded-md flex items-center mb-2 group"
                  onClick={() => setChecked2(id)}
                >
                  <Check
                    className={cn(
                      "w-4 h-4 mr-2 text-zinc-300 group-hover:text-zinc-700 transition-all",
                      checked2 === id && "text-zinc-700"
                    )}
                  />
                  {word}
                </div>
              ))}
          </ScrollArea>
        )}
        <div className="flex gap-1 w-full">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent((current) => current - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            disabled={!(checked1 && checked2)}
            className="w-full"
            onClick={() => {
              doneFunc(checked1!, checked2!);
              setChecked1(null);
              setChecked2(null);
              setCurrent(0);
              setOpen(false);
            }}
          >
            Добавить
          </Button>
          <Button
            variant="outline"
            disabled={current === 1}
            onClick={() => setCurrent((current) => current + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPair;
