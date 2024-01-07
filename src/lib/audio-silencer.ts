export function getWavBytes(buffer: any, options: any) {
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
export function getWavHeader(options: any) {
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

// Function to create a silent AudioBuffer of a given duration
export function createSilentBuffer(
  audioCtx: AudioContext,
  duration: number,
  sampleRate: number
) {
  const frameCount = sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, frameCount, sampleRate);
  return buffer; // buffer contains only silence
}

export function bufferToWave(abuffer: any, len: any) {
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

export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

export function audioBufferToWavBlob(audioBuffer: AudioBuffer) {
  return bufferToWave(audioBuffer, audioBuffer.length);
}

export function appendBuffer(
  audioCtx: AudioContext,
  buffer1: AudioBuffer,
  buffer2: AudioBuffer
) {
  const numberOfChannels = Math.min(
    buffer1.numberOfChannels,
    buffer2.numberOfChannels
  );
  const tmpBuffer = audioCtx.createBuffer(
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

export async function addSilenceToAudioBlob(
  audioCtx: AudioContext,
  audioBlob: Blob,
  silenceDuration: number
) {
  const originalBuffer = await blobToArrayBuffer(audioBlob).then(
    (arrayBuffer) => audioCtx.decodeAudioData(arrayBuffer)
  );
  const silentBuffer = createSilentBuffer(
    audioCtx,
    silenceDuration,
    audioCtx.sampleRate
  );
  const combinedBuffer = appendBuffer(audioCtx, originalBuffer, silentBuffer);
  const newBlob = await audioBufferToWavBlob(combinedBuffer);
  return newBlob;
}

import toWav from "audiobuffer-to-wav";

// Function to convert base64 string to Buffer
function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

// Function to convert base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = Buffer.from(base64, 'base64');
  const buffer = binaryString.buffer.slice(
    binaryString.byteOffset,
    binaryString.byteOffset + binaryString.byteLength
  );
  return buffer;
}


// Function to add silence to an AudioBuffer
export async function addSilenceToAudioDataUri(
  dataUri: string,
  silenceDuration: number
): Promise<string> {
  // Extract the base64 part of the data URI
  const base64String = dataUri.split(",")[1];
  const audioBuffer = base64ToArrayBuffer(base64String);

  const context = new AudioContext();

  // Decode the audio data to an AudioBuffer
  const originalBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
    context.decodeAudioData(audioBuffer, resolve, reject);
  });

  // Create a silent buffer
  const sampleRate = originalBuffer.sampleRate;
  const silenceBuffer = context.createBuffer(
    originalBuffer.numberOfChannels,
    sampleRate * silenceDuration,
    sampleRate
  );

  // Combine the original audio with the silent buffer
  const combinedLength = originalBuffer.length + silenceBuffer.length;
  const combinedBuffer = context.createBuffer(
    originalBuffer.numberOfChannels,
    combinedLength,
    sampleRate
  );

  // Copy the original audio data
  for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
    combinedBuffer
      .getChannelData(channel)
      .set(originalBuffer.getChannelData(channel));
  }

  // Add the silence to the end of the buffer by doing nothing, as the buffer is already silent

  // Encode the combined buffer to WAV
  const wav = toWav(combinedBuffer);

  // Convert the WAV buffer to a data URI
  const wavDataUri = `data:audio/wav;base64,${Buffer.from(wav).toString(
    "base64"
  )}`;

  return wavDataUri;
}

export async function concatenateAudioDataUris(dataUri1: string, dataUri2: string): Promise<string> {
  const context = new AudioContext();

  // Extract the base64 parts of the data URIs
  const base64String1 = dataUri1.split(',')[1];
  const base64String2 = dataUri2.split(',')[1];

  // Convert base64 strings to Buffers
  const audioBuffer1 = base64ToArrayBuffer(base64String1);
  const audioBuffer2 = base64ToArrayBuffer(base64String2);

  // Decode the audio data to AudioBuffers
  const originalBuffer1 = await new Promise<AudioBuffer>((resolve, reject) => {
    context.decodeAudioData(audioBuffer1, resolve, reject);
  });
  const originalBuffer2 = await new Promise<AudioBuffer>((resolve, reject) => {
    context.decodeAudioData(audioBuffer2, resolve, reject);
  });

  // Create a new buffer to hold the concatenated audio
  const combinedLength = originalBuffer1.length + originalBuffer2.length;
  const combinedBuffer = context.createBuffer(
    originalBuffer1.numberOfChannels,
    combinedLength,
    originalBuffer1.sampleRate
  );

  // Copy the first audio data
  for (let channel = 0; channel < originalBuffer1.numberOfChannels; channel++) {
    combinedBuffer.getChannelData(channel).set(originalBuffer1.getChannelData(channel));
  }

  // Copy the second audio data, starting at the end of the first
  for (let channel = 0; channel < originalBuffer2.numberOfChannels; channel++) {
    combinedBuffer.getChannelData(channel).set(originalBuffer2.getChannelData(channel), originalBuffer1.length);
  }

  // Encode the combined buffer to WAV
  const wav = toWav(combinedBuffer);

  // Convert the WAV buffer to a data URI
  const wavDataUri = `data:audio/wav;base64,${Buffer.from(wav).toString('base64')}`;

  return wavDataUri;
}

export function dataURItoBlob(dataURI: string): Blob {
  var byteString = atob(dataURI.split(",")[1]);
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], { type: mimeString });
  return blob;
}
