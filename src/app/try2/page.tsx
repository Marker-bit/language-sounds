"use client";

import AudioPlayback from "@/components/audio-playback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check, Mic, MicOff, Pause, PlayCircle, Square } from "lucide-react";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  word: z.string().min(1),
  language: z.string().min(1),
});

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: "",
      language: "",
    },
  });
  const [recordingStatus, setRecordingStatus] = useState("inactive");

  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Array<Blob>>([]);
  const [audio, setAudio] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const interval = useRef<NodeJS.Timeout | null>(null);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    if (!stream) return;
    setAudio(null);
    setRecordingStatus("recording");
    setRecordingTime(0);
    //create new Media recorder instance using the stream
    const media = new MediaRecorder(stream, { mimeType: "audio/webm" });
    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;
    //invokes the start method to start the recording process
    mediaRecorder.current.start();
    let localAudioChunks: Array<Blob> = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
    interval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 0.001);
    }, 1);
  };

  const pauseRecording = () => {
    if (!interval.current) return;
    if (!mediaRecorder.current) return;
    setRecordingStatus("paused");
    //pauses the recording instance
    mediaRecorder.current.pause();
    clearInterval(interval.current);
  };

  const unpauseRecording = () => {
    if (!mediaRecorder.current) return;
    setRecordingStatus("recording");
    //unpauses the recording instance
    mediaRecorder.current.resume();
    interval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 0.001);
    }, 1);
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return;
    setRecordingStatus("inactive");
    //stops the recording instance
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      let reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      //creates a playable URL from the blob file.
      reader.onload = function() {
        setAudio(reader.result as string);
      };

      // const audioUrl = URL.createObjectURL(audioBlob);
      // setAudio(audioUrl);
      setAudioChunks([]);
    };
    setRecordingTime(0);
    if (interval.current) clearInterval(interval.current);
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-1 items-center">
        {!permission && (
          <Button onClick={getMicrophonePermission} variant="outline">
            <MicOff className="w-5 h-5 mr-2" /> Get microphone permission
          </Button>
        )}
        {permission && recordingStatus === "inactive" && (
          <Button
            className="p-2 rounded-full"
            onClick={() => {
              startRecording();
            }}
          >
            <Mic />
          </Button>
        )}
        {recordingStatus === "recording" && (
          <Button
            className="p-2 rounded-full"
            onClick={pauseRecording}
            variant="outline"
          >
            <Pause />
          </Button>
        )}
        {recordingStatus === "paused" && (
          <Button
            className="p-2 rounded-full"
            onClick={unpauseRecording}
            variant="outline"
          >
            <PlayCircle />
          </Button>
        )}
        {(recordingStatus === "recording" || recordingStatus === "paused") && (
          <Button
            className="p-2 rounded-full"
            onClick={stopRecording}
            variant="outline"
          >
            <Square />
          </Button>
        )}
        {recordingTime > 0 && (
          <div className="text-xs text-zinc-400 dark:text-zinc-600">
            {recordingTime.toFixed(2)} sec
          </div>
        )}
        {audio && <AudioPlayback audio={audio} />}
        {audio && (
          <Dialog>
            <DialogTrigger>
              <Button className="p-2 rounded-full" variant="outline">
                <Check />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Recording</DialogTitle>
                <DialogDescription>
                  Please name the word you want to save.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="word"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Word</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="float-end">Submit</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
