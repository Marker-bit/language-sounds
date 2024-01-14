"use client"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Pause, PlayCircle, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function AudioPlayback({ audio }: { audio: string }) {
  const [audioController, setAudioController] =
    useState<HTMLAudioElement | null>(null);
  let [loading, setLoading] = useState(true);

  useEffect(() => {
    const aud = new Audio(audio);
    aud.addEventListener("loadeddata", () => {
      setLoading(false);
    });
    setAudioController(aud);
  }, [audio]);

  

  const play = () => {
    audioController?.play();
  };

  return loading ? (
    <Loader2 className="w-5 h-5 animate-spin" />
  ) : (
    <Button className={cn("p-2 rounded-full")} onClick={play} variant="outline">
      <Volume2 />
    </Button>
  );
}
