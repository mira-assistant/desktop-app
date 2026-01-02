'use client';

import { createContext, useCallback, useEffect, useState, useRef } from 'react';
import { MicVAD } from '@ricky0123/vad-web';
import { interactionsApi } from '@/lib/api/interactions';
import { useService } from '@/hooks/useService';

interface AudioContextType {
  // Just for debugging/monitoring if needed
  isProcessing: boolean;
}

export const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { clientName, isServiceEnabled } = useService();

  const [isProcessing, setIsProcessing] = useState(false);

  const vadRef = useRef<MicVAD | null>(null);
  const isStartingRef = useRef(false);

  // Auto-start/stop VAD when service enabled changes
  useEffect(() => {
    if (isServiceEnabled) {
      startVAD();
    } else {
      stopVAD();
    }

    return () => {
      stopVAD();
    };
  }, [isServiceEnabled, clientName]);

  const startVAD = useCallback(async () => {
    if (vadRef.current || isStartingRef.current || !clientName) return;

    isStartingRef.current = true;

    try {
      console.log('🎤 Starting VAD...');

      const vad = await MicVAD.new({
        modelURL: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.19/dist/silero_vad_v5.onnx',
        workletURL: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.19/dist/vad.worklet.bundle.min.js',

        onSpeechStart: () => {
          console.log('🗣️ Speech started');
        },

        onSpeechEnd: async (audio: Float32Array) => {
          console.log('🛑 Speech ended, sending audio...');
          setIsProcessing(true);

          try {
            const wavBuffer = float32ToWav(audio, 16000);
            await interactionsApi.register(wavBuffer, clientName, 'wav');
            console.log('✅ Audio sent');
            setIsProcessing(false);
          } catch (error) {
            console.error('❌ Failed to send audio:', error);
            setIsProcessing(false);
          }
        },

        onVADMisfire: () => {
          console.log('⚠️ VAD misfire');
        },

        positiveSpeechThreshold: 0.5,
        negativeSpeechThreshold: 0.35,
        minSpeechMs: 190,
        redemptionMs: 160,
        preSpeechPadMs: 20,
        submitUserSpeechOnPause: true,
      });

      vadRef.current = vad;
      await vad.start();

      console.log('✅ VAD started');
    } catch (error) {
      console.error('❌ Failed to start VAD:', error);
      vadRef.current = null;
    } finally {
      isStartingRef.current = false;
    }
  }, [clientName]);

  const stopVAD = useCallback(() => {
    if (!vadRef.current) return;

    try {
      console.log('🛑 Stopping VAD...');
      vadRef.current.destroy();
      vadRef.current = null;
      setIsProcessing(false);
      console.log('✅ VAD stopped');
    } catch (error) {
      console.error('❌ Failed to stop VAD:', error);
    }
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isProcessing,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

function float32ToWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}