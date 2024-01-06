import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Pause, PlayCircle, Volume2 } from "lucide-react";
import { useState } from "react";

export default function AudioPlayback({ audio }: { audio: string }) {
  let audioController = new Audio(audio);
  let [loading, setLoading] = useState(true);

  audioController.addEventListener("loadeddata", () => {
    setLoading(false);
  });

  const play = () => {
    audioController.play();
  };

  return loading ? (
    <Loader2 className="w-5 h-5 animate-spin" />
  ) : (
    <Button className={cn(
      "p-2 rounded-full",
    )} onClick={play} variant="outline">
      <Volume2 />
    </Button>
  );
}
