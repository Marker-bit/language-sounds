"use client";

import { useParams } from "next/navigation";

// import worker_script from "./worker.worker";

import AudioPlayback from "@/components/audio-playback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getDb, shuffleArray } from "@/lib/utils";
import {
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowDownZA,
  ArrowUpDown,
  ArrowUpNarrowWide,
  AudioLines,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  Plus,
  RotateCw,
  Save,
  Search,
  XIcon,
} from "lucide-react";
import * as React from "react";
import {
  addSilenceToAudioDataUri,
  audioBufferToWavBlob,
  concatenateAudioDataUris,
} from "@/lib/audio-silencer";

import type { Deck, Word } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import AudioController from "@/components/audio-controller";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { record } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddPair from "./AddPair";

const sorts = [
  {
    icon: <ArrowDownAZ className="mr-1 h-4 w-4" />,
    label: "По алфавиту (А-Я)",
    value: "a-z",
  },
  {
    icon: <ArrowDownZA className="mr-1 h-4 w-4" />,
    label: "По алфавиту (Я-А)",
    value: "z-a",
  },
  {
    icon: <CalendarDays className="mr-1 h-4 w-4" />,
    label: "По дате создания (сначала новые)",
    value: "newest",
  },
  {
    icon: <CalendarRange className="mr-1 h-4 w-4" />,
    label: "По дате создания (сначала старые)",
    value: "oldest",
  },
];

export default function Page() {
  const params = useParams();
  const [deck, setDeck] = React.useState<Deck | null>(null);
  const [languages, setLanguages] = React.useState<any[]>([]);
  const [words1, setWords1] = React.useState<any[]>([]);
  const [words2, setWords2] = React.useState<any[]>([]);
  const [saveSettingsDone, setSaveSettingsDone] =
    React.useState<boolean>(false);
  const [pairs, setPairs] = React.useState<any[]>([]);
  const [resultAudioUrl, setResultAudioUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [pairsReversed, setPairsReversed] = React.useState<boolean>(true);

  const [saveDone, setSaveDone] = React.useState<boolean>(false);

  const [recordedDone, setRecordedDone] = React.useState<number>(0);

  const audioCtx = React.useRef<any>(null);
  const [pairsDelay, setPairsDelay] = React.useState<number>(2);
  const [wordTranslationDelay, setWordTranslationDelay] =
    React.useState<number>(0.5);
  const [recordingLoading, setRecordingLoading] =
    React.useState<boolean>(false);
  const [swap, setSwap] = React.useState<boolean>(false);
  const [shuffle, setShuffle] = React.useState<boolean>(false);
  const [pairDialogOpen, setPairDialogOpen] = React.useState<boolean>(false);

  function reset() {
    setPairs([]);
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
    console.log("useEffect");
  }, []);

  React.useEffect(() => {
    importSettings();
    refreshDeck();
    console.log("useEffect");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React.useEffect(() => {
  //   setWorker(new Worker(new URL("./worker.worker.ts", import.meta.url)));
  //   return () => {
  //     if (worker) worker.terminate();
  //   };
  // }, []);

  async function makeRecording() {
    setRecordingLoading(true);
    // const myWorker = new Worker(worker_script);
    // if (!worker) {
    //   return;
    // }
    // const myWorker = worker;
    // console.log(myWorker);
    // let datauris = [];
    // for (const {selected1, selected2} of pairs) {
    //   datauris.push(selected1.audio);
    //   datauris.push(selected2.audio);
    // }
    // myWorker.postMessage(
    //   { mp3DataURI: datauris[0], silenceDuration: 5 },
    // );
    // myWorker.addEventListener("message", (m) => {
    //   console.log("msg from worker: ", m.data);
    //   console.log(m.data[0]);
    //   setResultAudioUrl(m.data[0]);
    // });
    // myWorker.onmessage = async (m: MessageEvent) => {
    //   console.log("msg from worker: ", m.data);
    //   const data = m.data;
    //   if (data.type === "decodeAudioData") {
    //     const audioCtx = new AudioContext();

    //     // Perform AudioContext operations here
    //     const audioBlob = await audioCtx.decodeAudioData(data.value.audioBuffer);
    //     // Send the processed data back to the worker
    //     worker.postMessage({ type: "decodeAudioDataDone", audioBlob });
    //   } else if (data.type === "recordedDone") {
    //     setRecordedDone(data.value);
    //   } else if (data.type === "audioUrl") {
    //     setResultAudioUrl(data.value);
    //     setRecordingLoading(false);
    //   }
    // };
    // myWorker.onmessage = (m) => {
    //   console.log("msg from worker: ", m.data);
    // };
    // myWorker.postMessage("im from main");
    setRecordingLoading(true);
    setRecordedDone(0);
    let fullyMerged = [];
    let changedPairs;
    if (shuffle) {
      changedPairs = shuffleArray([...pairs]);
    } else {
      changedPairs = [...pairs];
    }
    let i = 0;
    for (const w of changedPairs) {
      const { selected1: word1, selected2: word2, checked } = w;
      i++;
      if (checked === true) {
        setRecordedDone((i / pairs.length) * 50);
        continue;
      }
      const newDataUri = await addSilenceToAudioDataUri(
        swap ? word2.audio : word1.audio,
        wordTranslationDelay
      );
      const newDataUri2 = await addSilenceToAudioDataUri(
        swap ? word1.audio : word2.audio,
        pairsDelay
      );
      fullyMerged.push(newDataUri, newDataUri2);
      setRecordedDone((i / pairs.length) * 50);
    }
    setRecordedDone(0);
    let resultUri = "";
    i = 0;
    for (const uri of fullyMerged) {
      if (!resultUri) {
        resultUri = uri;
      } else {
        resultUri = await concatenateAudioDataUris(resultUri, uri);
      }
      i++;
      setRecordedDone(50 + (i / fullyMerged.length) * 50);
    }
    setResultAudioUrl(resultUri);
    setRecordingLoading(false);
  }

  function saveSettings() {
    window.localStorage.setItem(
      "settings",
      JSON.stringify({
        wordTranslationDelay,
        pairsDelay,
        shuffle,
        swap,
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
    setShuffle(settings.shuffle);
    setSwap(settings.swap);
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
      <p className="text-center">
        {deck?.fromLanguage?.title} — {deck?.toLanguage?.title}
      </p>
      {/* <DropdownMenu>
        <div className="flex items-center justify-center">
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <span className="mr-2">Сортировка:</span>
              {sorts.find((s) => s.value === currentSort)?.icon}
              {sorts.find((s) => s.value === currentSort)?.label}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent>
          {sorts.map((l) => (
            <DropdownMenuItem
              key={l.value}
              onClick={() => setCurrentSort(l.value)}
            >
              {currentSort === l.value ? (
                <Check className="mr-1 h-4 w-4" />
              ) : (
                l.icon
              )}
              {l.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu> */}

      {/* <div className="grid grid-cols-2 min-h-full">
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
      </div> */}
      <div className="flex flex-col gap-1 items-center mt-3">
        <div className="flex gap-1 items-stretch">
          <AddPair
            words={words1}
            words2={words2}
            doneFunc={(selected1: number, selected2: number) => {
              setPairs((pairs) => [
                ...pairs,
                {
                  selected1: words1.find((w) => w.id === selected1),
                  selected2: words2.find((w) => w.id === selected2),
                  checked: false,
                },
              ]);
              savePairs();
            }}
            pairs={pairs}
            open={pairDialogOpen}
            setOpen={setPairDialogOpen}
          />
          <Button
            className="w-fit p-2"
            variant="outline"
            onClick={() => setPairsReversed((a) => !a)}
          >
            <ArrowUpNarrowWide
              className={cn(
                "w-4 h-4 transition-transform",
                !pairsReversed && "rotate-180"
              )}
            />
            <div className="relative ml-1 flex">
              <div className="opacity-0">Сверху старые</div>
              <div
                className={cn(
                  "absolute transition-all",
                  !pairsReversed && "-translate-y-3 opacity-0"
                )}
              >
                Сверху новые
              </div>
              <div
                className={cn(
                  "absolute transition-all",
                  pairsReversed && "translate-y-3 opacity-0"
                )}
              >
                Сверху старые
              </div>
            </div>
          </Button>
          <Button onClick={savePairs} variant="outline" className="relative">
            <Check
              className={cn(
                "w-5 h-5 absolute transition-all",
                !saveDone && "scale-0"
              )}
            />
            <Save
              className={cn(
                "w-5 h-5 absolute transition-all",
                saveDone && "scale-0"
              )}
            />
          </Button>
        </div>

        {(pairsReversed ? pairs.toReversed() : pairs).map(
          ({
            selected1,
            selected2,
            checked,
          }: {
            selected1: Word;
            selected2: Word;
            checked: boolean;
          }) => (
            <div
              key={`${selected1?.id}-${selected2?.id}`}
              className="border border-zinc-200 rounded-md p-2 flex gap-1 items-center"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        setPairs((pairs) =>
                          pairs.map((p) => {
                            if (
                              p.selected1 === selected1 &&
                              p.selected2 === selected2
                            ) {
                              return {
                                ...p,
                                checked: !p.checked,
                              };
                            }
                            return p;
                          })
                        );
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Выучено?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* <AudioPlayback audio={selected1.audio!} /> */}
              <span>{selected1?.word}</span> —
              {/* <AudioPlayback audio={selected2.audio!} /> */}
              <span>{selected2?.word}</span>
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
        <div className="flex gap-1 flex-wrap justify-center items-center">
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
                    <Label>Между парами</Label>
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
                    <Label>Между словом и переводом</Label>
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
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="swap">
                      Поменять местами слово и перевод?
                    </Label>
                    <Switch
                      id="swap"
                      checked={swap}
                      onCheckedChange={setSwap}
                    />
                    {/* <Input
                      id="shuffle"
                      type="number"
                      className="col-span-2 h-8"
                      value={pairsDelay}
                      onChange={(e) => setPairsDelay(Number(e.target.value))}
                    /> */}
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="shuffle">Перемешать?</Label>
                    <Switch
                      id="shuffle"
                      checked={shuffle}
                      onCheckedChange={setShuffle}
                    />
                    {/* <Input
                      id="shuffle"
                      type="number"
                      className="col-span-2 h-8"
                      value={pairsDelay}
                      onChange={(e) => setPairsDelay(Number(e.target.value))}
                    /> */}
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
              <Button
                onClick={makeRecording}
                disabled={
                  recordingLoading ||
                  pairs.filter((w) => w.checked !== true).length == 0
                }
              >
                {recordingLoading ? (
                  <Loader2 className="w-5 h-5 mr-1 animate-spin" />
                ) : (
                  <AudioLines className="w-5 h-5 mr-1" />
                )}
                Создать запись
                {recordingLoading && (
                  <span className="ml-1 flex items-center">
                    (<Clock className="w-4 h-4 mr-1 inline" />
                    {recordedDone.toFixed(1)}%)
                  </span>
                )}
              </Button>
              {resultAudioUrl && (
                <>
                  {/* <AudioPlayback audio={resultAudioUrl} /> */}
                  <AudioController src={resultAudioUrl} />
                  <a href={resultAudioUrl} download>
                    <Button variant="outline" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
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
