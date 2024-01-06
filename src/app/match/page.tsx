"use client";

import AudioPlayback from "@/components/audio-playback";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConcatenateBlobs } from "@/lib/concatenate-blobs";
import { cn, getDb } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Download,
  RotateCw,
  Save,
} from "lucide-react";
import * as React from "react";
import { addSilenceToAudioBlob, dataURItoBlob } from "@/lib/audio-silencer";

import type { Word } from "@/types";

export default function Page() {
  const [languages, setLanguages] = React.useState<any[]>([]);
  const [words1, setWords1] = React.useState<any[]>([]);
  const [words2, setWords2] = React.useState<any[]>([]);
  const [changedWords1, setChangedWords1] = React.useState<any[]>([]);
  const [changedWords2, setChangedWords2] = React.useState<any[]>([]);
  const [selected1, setSelected1] = React.useState<any | null>(null);
  const [selected2, setSelected2] = React.useState<any | null>(null);
  const [pairs, setPairs] = React.useState<any[]>([]);
  const [resultAudioUrl, setResultAudioUrl] = React.useState<string>("");

  const [savedPairs, setSavedPairs] = React.useState<any[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = React.useState<number>(0);

  const audioCtx = React.useRef<any>(null);
  const [pairsDelay, setPairsDelay] = React.useState<number>(2);
  const [wordTranslationDelay, setWordTranslationDelay] =
    React.useState<number>(0.5);

  React.useEffect(() => {
    if (selected1 && selected2) {
      setPairs((prevPairs) => [...prevPairs, { selected1, selected2 }]);
      setChangedWords1((words1) => words1.filter((w) => w !== selected1));
      setChangedWords2((words2) => words2.filter((w) => w !== selected2));
      setSelected1(null);
      setSelected2(null);
    }
  }, [selected1, selected2]);

  function select1(value: number | null) {
    if (selected1 === value) {
      setSelected1(null);
      return;
    }
    setSelected1(value);
  }

  function select2(value: number | null) {
    if (selected2 === value) {
      setSelected2(null);
      return;
    }
    setSelected2(value);
  }

  async function updateWords1(value: string) {
    if (value === null) {
      setWords1([]);
      return;
    }
    getDb((db) => {
      let transaction = db.transaction("words", "readwrite");
      let store = transaction.objectStore("words");

      store.getAll().onsuccess = (event: any) => {
        setWords1(
          event.target.result.filter(
            (w: any) => w.languageId === parseInt(value)
          )
        );
        setChangedWords1(
          event.target.result.filter(
            (w: any) => w.languageId === parseInt(value)
          )
        );
        return;
      };
    });
  }

  function reset() {
    setPairs([]);
    setSelected1(null);
    setSelected2(null);
    setChangedWords1(words1);
    setChangedWords2(words2);
  }

  async function updateWords2(value: string) {
    if (value === null) {
      setWords2([]);
      return;
    }
    getDb((db) => {
      let transaction = db.transaction("words", "readwrite");
      let store = transaction.objectStore("words");

      store.getAll().onsuccess = (event: any) => {
        setWords2(
          event.target.result.filter(
            (w: any) => w.languageId === parseInt(value)
          )
        );
        setChangedWords2(
          event.target.result.filter(
            (w: any) => w.languageId === parseInt(value)
          )
        );
        return;
      };
    });
  }

  function savePairs() {
    getDb((db) => {
      let transaction = db.transaction("pairs", "readwrite");
      let store = transaction.objectStore("pairs");
      store.put({
        fromLanguageId: parseInt(words1[0].languageId),
        toLanguageId: parseInt(words2[0].languageId),
        pairs: pairs,
      }).onsuccess = () => {
        listPairs();
      };
    });
  }

  function listPairs() {
    getDb((db) => {
      let transaction = db.transaction("pairs", "readwrite");
      let store = transaction.objectStore("pairs");
      store.getAll().onsuccess = (event: any) => {
        setSavedPairs(event.target.result);
      };
    });
  }

  React.useEffect(() => {
    audioCtx.current = new window.AudioContext();
  }, []);

  async function makeRecording() {
    let fullyMerged = [];
    for (const w of pairs) {
      const { selected1: word1, selected2: word2 } = w;
      let blob1 = dataURItoBlob(word1.audio);
      let blob2 = dataURItoBlob(word2.audio);

      const newAudioBlob = await addSilenceToAudioBlob(
        audioCtx.current,
        blob1,
        wordTranslationDelay
      );
      const newAudioBlob2 = await addSilenceToAudioBlob(
        audioCtx.current,
        blob2,
        pairsDelay
      );
      fullyMerged.push(newAudioBlob, newAudioBlob2);
    }
    ConcatenateBlobs(fullyMerged, "audio/wav", (res: Blob) => {
      // const audioElement = new Audio(URL.createObjectURL(res));
      // audioElement.controls = true;
      // document.body.appendChild(audioElement);
      // let reader = new FileReader();
      // reader.readAsDataURL(res);
      // //creates a playable URL from the blob file.
      // reader.onload = function () {
      //   setResultAudioUrl(reader.result as string);
      // };
      setResultAudioUrl(URL.createObjectURL(res));
    });
  }

  function importPair(id: number) {
    getDb((db) => {
      let transaction = db.transaction("pairs", "readwrite");
      let store = transaction.objectStore("pairs");
      store.get(id).onsuccess = async (event: any) => {
        reset();
        const pair = event.target.result;
        setPairs(pair.pairs);
        await updateWords1(pair.fromLanguageId.toString());
        await updateWords2(pair.toLanguageId.toString());
        setTimeout(() => {
          for (const w of pair.pairs) {
            const { selected1: word1, selected2: word2 } = w;
            setChangedWords1((prev) => prev.filter((w) => w.id !== word1.id));
            setChangedWords2((prev) => prev.filter((w) => w.id !== word2.id));
          }
        }, 100);
      };
    });
  }

  React.useEffect(() => {
    listPairs();
    getDb((db) => {
      let transaction = db.transaction("languages", "readwrite");
      let store = transaction.objectStore("languages");

      store.getAll().onsuccess = (event: any) => {
        setLanguages(event.target.result);
      };
    });
  }, []);
  return (
    <>
      <div className="grid grid-cols-2 min-h-full">
        <div className="flex flex-col gap-1 items-center">
          <Combobox
            variants={languages.map((language) => ({
              value: language.id.toString(),
              label: language.title,
            }))}
            placeholder="Выберите язык"
            notFoundMessage="Ничего не нашлось"
            onUpdate={updateWords1}
          />
          {changedWords1.map((word) => (
            <div
              key={word.id}
              className={cn(
                "border border-zinc-200 rounded-md p-2 cursor-pointer transition",
                word === selected1 ? "bg-zinc-200" : ""
              )}
              onClick={() => select1(word)}
            >
              {word.word}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 items-center">
          <Combobox
            variants={languages.map((language) => ({
              value: language.id.toString(),
              label: language.title,
            }))}
            placeholder="Выберите язык"
            notFoundMessage="Ничего не нашлось"
            onUpdate={updateWords2}
          />
          {changedWords2.map((word) => (
            <div
              key={word.id}
              className={cn(
                "border border-zinc-200 rounded-md p-2 cursor-pointer transition",
                word === selected2 ? "bg-zinc-200" : ""
              )}
              onClick={() => select2(word)}
            >
              {word.word}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1 items-center mt-3">
        {pairs.map(({ selected1, selected2 }) => (
          <div
            key={selected1.id}
            className="border border-zinc-200 rounded-md p-2 flex gap-1 items-center"
          >
            <AudioPlayback audio={selected1.audio} />
            <span>{selected1.word}</span> —
            <AudioPlayback audio={selected2.audio} />
            <span>{selected2.word}</span>
          </div>
        ))}
        <div className="flex gap-1 flex-wrap justify-center">
          {savedPairs.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" onClick={listPairs}>
                  Импорт
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center flex-wrap">
                      <h4 className="font-medium leading-none">Импорт пар</h4>
                      <div className="text-sm text-zinc-400 flex gap-1 items-center">
                        <Button
                          variant="ghost"
                          className="rounded-full p-1 h-auto"
                          disabled={currentPairIndex === 0}
                          onClick={() => setCurrentPairIndex((i) => i - 1)}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <span>{currentPairIndex + 1}</span>
                        <span>/</span>
                        <span>{savedPairs.length}</span>
                        <Button
                          variant="ghost"
                          className="rounded-full p-1 h-auto"
                          disabled={currentPairIndex === savedPairs.length - 1}
                          onClick={() => setCurrentPairIndex((i) => i + 1)}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Выберите колоду.
                    </p>
                  </div>
                  <div className="flex">
                    {/* {savedPairs.map((pair) => (
                      <div
                        key={pair.id}
                        className="border border-zinc-200 rounded-md p-2 cursor-pointer transition"
                      >
                        {pair.pairs[0].selected1.word}
                      </div>
                    ))} */}
                    {savedPairs[currentPairIndex].pairs.map(
                      ({
                        selected1,
                        selected2,
                      }: {
                        selected1: Word;
                        selected2: Word;
                      }) => (
                        <div
                          key={selected1.id}
                          className="flex gap-1 items-center max-md:flex-wrap"
                        >
                          <AudioPlayback audio={selected1.audio!} />
                          <span>{selected1.word}</span> —
                          <AudioPlayback audio={selected2.audio!} />
                          <span>{selected2.word}</span>
                        </div>
                      )
                    )}
                  </div>
                  <Button onClick={() => importPair(savedPairs[currentPairIndex].id)}>Импорт</Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {pairs.length !== 0 && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Настройки</Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">
                        Настройки озвучки
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Выберите паузы между словами.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="width">Между парами</Label>
                        <Input
                          id="pairsDelay"
                          type="number"
                          className="col-span-2 h-8"
                          value={pairsDelay}
                          onChange={(e) =>
                            setPairsDelay(Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Пауза между парами слов.
                        <br />
                        Например: &quot;—&quot; ⏳ &quot;—&quot; [пауза между
                        парами] &quot;—&quot; ⏳ &quot;—&quot; [пауза между
                        парами]{" "}
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="maxWidth">
                          Между словом и переводом
                        </Label>
                        <Input
                          id="wordTranslationDelay"
                          className="col-span-2 h-8"
                          type="number"
                          value={wordTranslationDelay}
                          onChange={(e) =>
                            setWordTranslationDelay(Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={savePairs} variant="ghost">
                <Save className="w-5 h-5 mr-1" />
                Сохранить
              </Button>
              <Button onClick={reset} variant="ghost">
                <RotateCw className="w-5 h-5 mr-1" />
                Сбросить
              </Button>
              <Button onClick={makeRecording}>
                <AudioLines className="w-5 h-5 mr-1" />
                Создать запись
              </Button>
              {resultAudioUrl && (
                <>
                  <AudioPlayback audio={resultAudioUrl} />
                  <audio src={resultAudioUrl} controls />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
