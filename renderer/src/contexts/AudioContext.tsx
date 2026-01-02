'use client';

import { createContext, useEffect, useState } from 'react';
import { useMicVAD, utils } from '@ricky0123/vad-react';
import { interactionsApi } from '@/lib/api/interactions';
import { useService } from '@/hooks/useService';

interface AudioContextType {
  isProcessing: boolean;
}

export const AudioContext = createContext<AudioContextType | undefined>(undefined);

function calculateRMS(audio: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < audio.length; i++) {
    sum += audio[i] * audio[i];
  }
  return Math.sqrt(sum / audio.length);
}

function hasSignificantAudio(audio: Float32Array): boolean {
  const rms = calculateRMS(audio);
  const minRMS = 0.01; // Minimum RMS threshold
  const maxRMS = 0.3;  // Maximum RMS threshold

  // Check if audio is too quiet (likely silence/noise)
  if (rms < minRMS) {
    console.log('[VAD] Rejected: Too quiet (RMS:', rms.toFixed(4), ')');
    return false;
  }

  // Check if audio is clipping (too loud/distorted)
  if (rms > maxRMS) {
    console.log('[VAD] Rejected: Too loud/clipping (RMS:', rms.toFixed(4), ')');
    return false;
  }

  // Check duration (too short = noise, too long = picked up ambient)
  const durationSeconds = audio.length / 16000;
  const minDuration = 0.5; // 500ms minimum
  const maxDuration = 10;  // 10 seconds maximum

  if (durationSeconds < minDuration) {
    console.log('[VAD] Rejected: Too short (', durationSeconds.toFixed(2), 's)');
    return false;
  }

  if (durationSeconds > maxDuration) {
    console.log('[VAD] Rejected: Too long (', durationSeconds.toFixed(2), 's)');
    return false;
  }

  console.log('[VAD] Accepted: RMS=', rms.toFixed(4), 'Duration=', durationSeconds.toFixed(2), 's');
  return true;
}

// Replace the WAV encoding
function encodeWAV(samples: Float32Array, sampleRate: number = 16000): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono (1 channel)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Convert float32 to int16
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { clientName, isServiceEnabled } = useService();
  const [isProcessing, setIsProcessing] = useState(false);

  const vad = useMicVAD({
    baseAssetPath: '/',
    onnxWASMBasePath: '/',
    model: 'v5',

    startOnLoad: false,

    onSpeechStart: () => {
      console.log('[VAD] Speech started');
    },

    // Update onSpeechEnd
    onSpeechEnd: async (audio: Float32Array) => {
      console.log('[VAD] Speech ended');
      console.log('[VAD] Audio length:', audio.length, 'samples');
      console.log('[VAD] Duration:', (audio.length / 16000).toFixed(2), 's');

      if (!hasSignificantAudio(audio)) {
        console.log('[VAD] Audio rejected - quality check failed');
        return;
      }

      setIsProcessing(true);

      try {
        const wavBuffer = encodeWAV(audio, 16000); // Use custom encoder
        console.log('[VAD] Sending audio:', wavBuffer.byteLength, 'bytes');
        await interactionsApi.register(wavBuffer, clientName, 'wav');
        console.log('[VAD] Audio sent successfully');
        setIsProcessing(false);
      } catch (error) {
        console.error('[VAD] Failed to send audio:', error);
        setIsProcessing(false);
      }
    },

    onVADMisfire: () => {
      console.log('[VAD] Misfire detected');
    },

    // Very selective thresholds
    positiveSpeechThreshold: 0.85,  // Higher = more selective for speech start
    negativeSpeechThreshold: 0.6,   // Higher = quicker to end speech detection

    // Frame settings for tighter control
    redemptionMs: 300,      // 300ms before ending speech
    minSpeechMs: 500,       // 500ms minimum speech duration
    preSpeechPadMs: 100,    // 100ms padding before speech

    submitUserSpeechOnPause: false,
  });

  useEffect(() => {
    if (isServiceEnabled && !vad.listening && !vad.loading) {
      console.log('[VAD] Starting VAD');
      vad.start();
    } else if (!isServiceEnabled && vad.listening) {
      console.log('[VAD] Pausing VAD');
      vad.pause();
    }
  }, [isServiceEnabled, vad.listening, vad.loading]);

  useEffect(() => {
    if (vad.loading) {
      console.log('[VAD] Loading...');
    }
    if (vad.listening) {
      console.log('[VAD] Listening active');
    }
    if (vad.errored) {
      console.error('[VAD] Error:', vad.errored);
    }
  }, [vad.listening, vad.errored, vad.loading]);

  return (
    <AudioContext.Provider value={{ isProcessing }}>
      {children}
    </AudioContext.Provider>
  );
}