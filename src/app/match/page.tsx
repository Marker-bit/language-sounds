"use client";

import AudioPlayback from "@/components/audio-playback";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { ConcatenateBlobs } from "@/lib/concatenate-blobs";
import { cn, getDb } from "@/lib/utils";
import { AudioLines, Download, RotateCw } from "lucide-react";
import Link from "next/link";
import * as React from "react";

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
  const audioCtx = React.useRef<any>(null);
  const [delay, setDelay] = React.useState<number>(0);

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

  function updateWords1(value: string) {
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

  function updateWords2(value: string) {
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
      };
    });
  }

  // Returns Uint8Array of WAV bytes
  function getWavBytes(buffer: any, options: any) {
    const type = options.isFloat ? Float32Array : Uint16Array;
    const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;

    const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }));
    const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

    // prepend header, then add pcmBytes
    wavBytes.set(headerBytes, 0);
    wavBytes.set(new Uint8Array(buffer), headerBytes.length);

    return wavBytes;
  }

  // adapted from https://gist.github.com/also/900023
  // returns Uint8Array of WAV header bytes
  function getWavHeader(options: any) {
    const numFrames = options.numFrames;
    const numChannels = options.numChannels || 2;
    const sampleRate = options.sampleRate || 44100;
    const bytesPerSample = options.isFloat ? 4 : 2;
    const format = options.isFloat ? 3 : 1;

    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numFrames * blockAlign;

    const buffer = new ArrayBuffer(44);
    const dv = new DataView(buffer);

    let p = 0;

    function writeString(s: string) {
      for (let i = 0; i < s.length; i++) {
        dv.setUint8(p + i, s.charCodeAt(i));
      }
      p += s.length;
    }

    function writeUint32(d: any) {
      dv.setUint32(p, d, true);
      p += 4;
    }

    function writeUint16(d: any) {
      dv.setUint16(p, d, true);
      p += 2;
    }

    writeString("RIFF"); // ChunkID
    writeUint32(dataSize + 36); // ChunkSize
    writeString("WAVE"); // Format
    writeString("fmt "); // Subchunk1ID
    writeUint32(16); // Subchunk1Size
    writeUint16(format); // AudioFormat https://i.stack.imgur.com/BuSmb.png
    writeUint16(numChannels); // NumChannels
    writeUint32(sampleRate); // SampleRate
    writeUint32(byteRate); // ByteRate
    writeUint16(blockAlign); // BlockAlign
    writeUint16(bytesPerSample * 8); // BitsPerSample
    writeString("data"); // Subchunk2ID
    writeUint32(dataSize); // Subchunk2Size

    return new Uint8Array(buffer);
  }

  React.useEffect(() => {
    audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
  });

  // Function to fetch and decode the original audio blob
  async function decodeAudioData(blob: Blob) {
    const arrayBuffer = await blobToArrayBuffer(blob);
    return audioCtx.current.decodeAudioData(arrayBuffer);
  }

  // Function to create a silent AudioBuffer of a given duration
  function createSilentBuffer(duration: number, sampleRate: number) {
    const frameCount = sampleRate * duration;
    const buffer = audioCtx.current.createBuffer(1, frameCount, sampleRate);
    return buffer; // buffer contains only silence
  }

  // Function to concatenate two AudioBuffers
  function concatenateAudioBuffers(buffer1: any, buffer2: any) {
    const numberOfChannels = Math.min(
      buffer1.numberOfChannels,
      buffer2.numberOfChannels
    );
    const tmpBuffer = audioCtx.current.createBuffer(
      numberOfChannels,
      buffer1.length + buffer2.length,
      buffer1.sampleRate
    );

    for (let i = 0; i < numberOfChannels; i++) {
      const channelData = tmpBuffer.getChannelData(i);
      channelData.set(buffer1.getChannelData(i), 0);
      channelData.set(buffer2.getChannelData(i), buffer1.length);
    }
    return tmpBuffer;
  }

  function bufferToWave(abuffer: any, len: any) {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }

    // create Blob
    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data: any) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: any) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }

  // Function to convert an AudioBuffer to a Blob
  function audioBufferToBlob(audioBuffer: AudioBuffer) {
    // Use the OfflineAudioContext to render the combined AudioBuffer
    const left = audioBuffer.getChannelData(0);
    // interleaved
    const interleaved = new Float32Array(left.length);
    for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
      interleaved[dst] = left[src];
    }
    // get WAV file bytes and audio params of your audio source
    const wavBytes = getWavBytes(interleaved.buffer, {
      isFloat: true, // floating point or 16-bit integer
      numChannels: 2,
      sampleRate: 48000,
    });
    const wav = new Blob([wavBytes], { type: "audio/wav" });
    return wav;
  }

  // Step 2: Read the WebM blob as an ArrayBuffer
  const blobToArrayBuffer = async (blob: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  };

  // Step 3: Decode the audio data to an AudioBuffer
  const decodeAudioDataArrayBuffer = async (arrayBuffer: ArrayBuffer) => {
    return audioCtx.current.decodeAudioData(arrayBuffer);
  };

  // Helper function to convert an AudioBuffer to a WAV Blob
  const audioBufferToWavBlob = (audioBuffer: AudioBuffer) => {
    // Here you would use the code provided by Russell Good to convert the buffer to WAV
    // You can find the `bufferToWave` function from the instructions above
    return bufferToWave(audioBuffer, audioBuffer.length);
  };

  // Step 4: Use the AudioBuffer to create a WAV file
  const convertToWav = async (webmBlob: Blob) => {
    try {
      const arrayBuffer: ArrayBuffer = await blobToArrayBuffer(webmBlob);
      const audioBuffer = await decodeAudioData(webmBlob);
      const wavBlob = audioBufferToWavBlob(audioBuffer);
      return wavBlob;
    } catch (error) {
      console.error("Conversion error:", error);
    }
  };

  function appendBuffer(buffer1: AudioBuffer, buffer2: AudioBuffer) {
    const numberOfChannels = Math.min(
      buffer1.numberOfChannels,
      buffer2.numberOfChannels
    );
    const tmpBuffer = audioCtx.current.createBuffer(
      numberOfChannels,
      buffer1.length + buffer2.length,
      buffer1.sampleRate
    );
    for (let i = 0; i < numberOfChannels; i++) {
      const channel = tmpBuffer.getChannelData(i);
      channel.set(buffer1.getChannelData(i), 0);
      channel.set(buffer2.getChannelData(i), buffer1.length);
    }
    return tmpBuffer;
  }

  // Main function to add silence to the original audio blob
  // async function addSilenceToAudioBlob(
  //   originalBlob: Blob,
  //   silenceDurationInSeconds: number
  // ) {
  //   // Decode the original audio blob into an AudioBuffer
  //   // const originalBuffer = await decodeAudioData(originalBlob);

  //   // Create a silent AudioBuffer
  //   const silentBuffer = createSilentBuffer(silenceDurationInSeconds, 48000);
  //   const silentBlob = await audioBufferToBlob(silentBuffer);

  //   // Concatenate the original AudioBuffer with the silent AudioBuffer
  //   const combinedBlob = new Blob(
  //     [await originalBlob.arrayBuffer(), await silentBlob.arrayBuffer()],
  //     { type: originalBlob.type }
  //   );

  //   // Convert the combined AudioBuffer back into a blob
  //   // const newBlob = await audioBufferToBlob(combinedBuffer);

  //   return combinedBlob;
  // }

  async function addSilenceToAudioBlob(
    audioBlob: Blob,
    silenceDuration: number
  ) {
    const originalBuffer = await blobToArrayBuffer(audioBlob).then(
      (arrayBuffer) => audioCtx.current.decodeAudioData(arrayBuffer)
    );
    const silentBuffer = createSilentBuffer(
      silenceDuration,
      audioCtx.current.sampleRate
    );
    const combinedBuffer = appendBuffer(originalBuffer, silentBuffer);
    const newBlob = await audioBufferToWavBlob(combinedBuffer);
    return newBlob;
  }

  function dataURItoBlob(dataURI: string): Blob {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(",")[1]);
    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    // create a view into the buffer
    var ia = new Uint8Array(ab);
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: mimeString });
    return blob;
  }

  async function makeRecording() {
    let fullyMerged = [];
    for (const w of pairs) {
      const { selected1: word1, selected2: word2 } = w;
      let blob1 = dataURItoBlob(word1.audio);
      let blob2 = dataURItoBlob(word2.audio);

      const newAudioBlob = await addSilenceToAudioBlob(blob1, delay);
      const newAudioBlob2 = await addSilenceToAudioBlob(blob2, delay);
      console.log(newAudioBlob.type, newAudioBlob2.type);
      // let merged = new Blob([newAudioBlob, newAudioBlob2], {
      //   type: newAudioBlob.type,
      // });
      fullyMerged.push(newAudioBlob, newAudioBlob2);
      // Promise.all([blob1.arrayBuffer(), blob2.arrayBuffer()]).then((res) => console.log(res));
      // console.log(blob1, blob2, merged);
      // let reader = new FileReader();
      // reader.readAsDataURL(merged);
      // //creates a playable URL from the blob file.
      // reader.onload = function () {
      //   console.log(reader.result);
      // };
    }
    // for (const blob of fullyMerged) {
    //   const audioElement = new Audio(URL.createObjectURL(blob));
    //   audioElement.controls = true;
    //   document.body.appendChild(audioElement);

    // }
    // for (const blob of fullyMerged) {
    //   const audioElement = new Audio(URL.createObjectURL(blob));
    //   audioElement.controls = true;
    //   document.body.appendChild(audioElement);
    // }
    // const fullyMergedArrayBuffer: ArrayBuffer[] = [];
    // for (const blob of fullyMerged) {
    //   const audioElement = new Audio(URL.createObjectURL(blob));
    //   audioElement.controls = true;
    //   document.body.appendChild(audioElement);
    //   fullyMergedArrayBuffer.push(await blobToArrayBuffer(blob));
    // }
    // let fullyMergedBlob = new Blob(fullyMergedArrayBuffer, { type: "audio/wav" });
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

    // Do something with the new audio blob
    // For example, create an audio element to play it
  }

  React.useEffect(() => {
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
        {pairs.length !== 0 && (
          <div className="flex gap-1">
            <Input
              type="number"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              placeholder="Перерыв между словами в секундах"
            />
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
                {/* <Link href={resultAudioUrl} download={true}>
            <Button variant="ghost" className="rounded-full p-2">
              <Download className="w-5 h-5" />
            </Button>
          </Link> */}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
