"use client";

import { useParams } from "next/navigation";

import AudioPlayback from "@/components/audio-playback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getDb } from "@/lib/utils";
import {
  AudioLines,
  Check,
  Loader2,
  RotateCw,
  Save,
  XIcon,
} from "lucide-react";
import * as React from "react";
import {
  addSilenceToAudioDataUri,
  concatenateAudioDataUris,
} from "@/lib/audio-silencer";

import type { Deck, Word } from "@/types";

export default function Page() {
  const params = useParams();
  const [deck, setDeck] = React.useState<Deck | null>(null);
  const [languages, setLanguages] = React.useState<any[]>([]);
  const [words1, setWords1] = React.useState<any[]>([]);
  const [words2, setWords2] = React.useState<any[]>([]);
  const [saveSettingsDone, setSaveSettingsDone] =
    React.useState<boolean>(false);
  const [selected1, setSelected1] = React.useState<any | null>(null);
  const [selected2, setSelected2] = React.useState<any | null>(null);
  const [pairs, setPairs] = React.useState<any[]>([]);
  const [resultAudioUrl, setResultAudioUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const [saveDone, setSaveDone] = React.useState<boolean>(false);

  const audioCtx = React.useRef<any>(null);
  const [pairsDelay, setPairsDelay] = React.useState<number>(2);
  const [wordTranslationDelay, setWordTranslationDelay] =
    React.useState<number>(0.5);

  React.useEffect(() => {
    if (selected1 && selected2) {
      setPairs((prevPairs) => [...prevPairs, { selected1, selected2 }]);
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

  function reset() {
    setPairs([]);
    setSelected1(null);
    setSelected2(null);
  }

  function savePairs() {
    setSaveDone(false);
    getDb((db) => {
      let transaction = db.transaction("pairs", "readwrite");
      let store = transaction.objectStore("pairs");

      store.put({
        ...deck,
        pairs: pairs,
      }).onsuccess = () => {
        setSaveDone(true);
        setTimeout(() => setSaveDone(false), 1000);
      };
    });
  }

  function refreshDeck() {
    setLoading(true);
    getDb((db) => {
      let transaction = db.transaction("pairs", "readwrite");
      let store = transaction.objectStore("pairs");
      store.get(parseInt(params.deckId as string)).onsuccess = (event: any) => {
        setLoading(false);
        setDeck(event.target.result);
        setPairs(event.target.result.pairs);
        console.log(event.target.result);
        let transaction = db.transaction("words", "readwrite");
        let words = transaction.objectStore("words");

        words.getAll().onsuccess = (event2: any) => {
          setWords1(
            event2.target.result.filter(
              (w: any) => w.languageId === event.target.result.fromLanguageId
            )
          );
          setWords2(
            event2.target.result.filter(
              (w: any) => w.languageId === event.target.result.toLanguageId
            )
          );
        };
      };
    });
  }

  React.useEffect(() => {
    audioCtx.current = new window.AudioContext();
  }, []);

  React.useEffect(() => {
    importSettings();
    refreshDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function makeRecording() {
    let fullyMerged = [];
    for (const w of pairs) {
      const { selected1: word1, selected2: word2 } = w;
      const newDataUri = await addSilenceToAudioDataUri(
        word1.audio,
        wordTranslationDelay
      );
      const newDataUri2 = await addSilenceToAudioDataUri(
        word2.audio,
        pairsDelay
      );
      fullyMerged.push(newDataUri, newDataUri2);
    }
    let resultUri = "";
    for (const uri of fullyMerged) {
      if (!resultUri) {
        resultUri = uri;
      } else {
        resultUri = await concatenateAudioDataUris(resultUri, uri);
      }
    }
    setResultAudioUrl(resultUri);
  }

  function saveSettings() {
    window.localStorage.setItem(
      "settings",
      JSON.stringify({
        wordTranslationDelay,
        pairsDelay,
      })
    );
    setSaveSettingsDone(true);
    setTimeout(() => setSaveSettingsDone(false), 1000);
  }

  function importSettings() {
    const settingsJson = window.localStorage.getItem("settings");
    if (!settingsJson) {
      return;
    }
    const settings = JSON.parse(settingsJson);
    setWordTranslationDelay(settings.wordTranslationDelay);
    setPairsDelay(settings.pairsDelay);
  }

  function removePair({ selected1, selected2 }: any) {
    setPairs((prevPairs) =>
      prevPairs.filter(
        (p) => p.selected1 !== selected1 && p.selected2 !== selected2
      )
    );
  }

  // React.useEffect(() => {
  //   getDb((db) => {
  //     let transaction = db.transaction("languages", "readwrite");
  //     let store = transaction.objectStore("languages");

  //     store.getAll().onsuccess = (event: any) => {
  //       setLanguages(event.target.result);
  //     };
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }
  return (
    <div className="p-2">
      <h1 className="text-3xl text-center">{deck?.title || "Без названия"}</h1>
      <div className="grid grid-cols-2 min-h-full">
        <div className="flex flex-col gap-1 items-center">
          <p>{deck?.fromLanguage?.title}</p>
          {words1.map((word) => {
            for (const { selected1, selected2 } of pairs) {
              if (word.id === selected1?.id || word.id === selected2?.id) {
                return null;
              }
            }
            return (
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
            );
          })}
        </div>
        <div className="flex flex-col gap-1 items-center">
          <p>{deck?.toLanguage?.title}</p>
          {words2.map((word) => {
            for (const { selected1, selected2 } of pairs) {
              if (word.id === selected1?.id || word.id === selected2?.id) {
                return null;
              }
            }
            return (
              <div
                key={word.id}
                className={cn(
                  "border border-zinc-200 rounded-md p-2 cursor-pointer transition",
                  word === selected1 ? "bg-zinc-200" : ""
                )}
                onClick={() => select2(word)}
              >
                {word.word}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1 items-center mt-3">
        {pairs.map(
          ({ selected1, selected2 }: { selected1: Word; selected2: Word }) => (
            <div
              key={selected1.id}
              className="border border-zinc-200 rounded-md p-2 flex gap-1 items-center"
            >
              <AudioPlayback audio={selected1.audio!} />
              <span>{selected1.word}</span> —
              <AudioPlayback audio={selected2.audio!} />
              <span>{selected2.word}</span>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => removePair({ selected1, selected2 })}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          )
        )}
        <div className="flex gap-1 flex-wrap justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Настройки</Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 max-sm:w-lvw">
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
                      onChange={(e) => setPairsDelay(Number(e.target.value))}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Пауза между парами слов.
                    <br />
                    Например: &quot;—&quot; ⏳ &quot;—&quot; [пауза между
                    парами] &quot;—&quot; ⏳ &quot;—&quot; [пауза между парами]{" "}
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="maxWidth">Между словом и переводом</Label>
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
                  {saveSettingsDone ? (
                    <Button
                      className="mt-2"
                      onClick={saveSettings}
                      variant="outline"
                    >
                      <Check className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button
                      className="mt-2"
                      onClick={saveSettings}
                      variant="outline"
                    >
                      Сохранить настройки
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={savePairs} variant="ghost">
            {saveDone ? (
              <>
                <Check className="w-5 h-5 mr-1" />
                Сохранено
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-1" />
                Сохранить
              </>
            )}
          </Button>
          {pairs.length !== 0 && (
            <>
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
    </div>
  );
}
