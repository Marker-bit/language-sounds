import React, { useState, useRef, useEffect } from "react";
import { Slider } from "./ui/slider";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { Button } from "./ui/button";
import { Pause, Play, Volume, Volume1, Volume2, VolumeX } from "lucide-react";

const AudioController = ({ src }: { src: string }) => {
  const audioRef = useRef(new Audio(src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100); // Default volume (100%)
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audioContro = audioRef.current;
    const updateProgress = () => {
      setProgress(
        (audioRef.current.currentTime / audioRef.current.duration) * 100
      );
    };

    audioContro.addEventListener("timeupdate", updateProgress);

    return () => {
      audioContro.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    audioRef.current.volume = value[0] / 100;
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = (audioRef.current.duration / 100) * value[0];
    setProgress(value[0]);
    audioRef.current.currentTime = newTime;
  };

  return (
    <div className="flex items-center space-x-4 rounded-md border border-zinc-200 p-2">
      <Button size="icon" onClick={togglePlayPause}>
        {isPlaying ? <Pause /> : <Play />}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center">
            {/* icon */}
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : volume < 50 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span className="ml-1">{volume + "%"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="p-4 bg-white rounded shadow-lg">
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={100}
            step={1}
            className="w-[10vw] relative flex items-center select-none touch-action-none"
          />
        </PopoverContent>
      </Popover>

      <Slider
        value={[progress]}
        onValueChange={handleProgressChange}
        min={0}
        max={100}
        step={0.1}
        className="w-[10vw] relative flex-grow select-none touch-action-none"
      />
    </div>
  );
};

export default AudioController;
