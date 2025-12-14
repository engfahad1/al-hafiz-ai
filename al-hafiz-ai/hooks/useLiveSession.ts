import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';
import { createPcmBlob, decode, decodeAudioData } from '../utils/audio';

interface UseLiveSessionProps {
  surahName: string;
  onTranscript: (text: string, sender: 'user' | 'ai') => void;
}

export const useLiveSession = ({ surahName, onTranscript }: UseLiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false); // If AI is talking
  const [volume, setVolume] = useState(0); // For visualization
  
  // Refs for cleanup
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const connect = useCallback(async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      // Start Session
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION(surahName),
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log("Connection Opened");
            setIsConnected(true);

            // Setup Input Processing (Mic -> Model)
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume meter
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 5, 1));

              const pcmBlob = createPcmBlob(inputData);
              
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`, **do not** add other condition checks.
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
             // Handle Transcriptions
            if (msg.serverContent?.outputTranscription?.text) {
               onTranscript(msg.serverContent.outputTranscription.text, 'ai');
            }
            if (msg.serverContent?.inputTranscription?.text) {
               // Optional: onTranscript(msg.serverContent.inputTranscription.text, 'user');
            }

            // Handle Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               setIsTalking(true);
               const ctx = outputAudioContextRef.current;
               if (!ctx) return;

               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 ctx,
                 24000,
                 1
               );

               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               
               source.addEventListener('ended', () => {
                  sourceNodesRef.current.delete(source);
                  if (sourceNodesRef.current.size === 0) setIsTalking(false);
               });

               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourceNodesRef.current.add(source);
            }

            if (msg.serverContent?.interrupted) {
                console.log("Interrupted");
                sourceNodesRef.current.forEach(node => node.stop());
                sourceNodesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsTalking(false);
            }
          },
          onclose: () => {
            console.log("Connection Closed");
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error("Connection Error", err);
            setIsConnected(false);
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to initialize session", error);
      alert("Error accessing microphone or connecting to AI.");
    }
  }, [surahName, onTranscript]);

  const disconnect = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current?.state !== 'closed') inputAudioContextRef.current?.close();
    if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close();

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    
    setIsConnected(false);
    setIsTalking(false);
    setVolume(0);
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { connect, disconnect, isConnected, isTalking, volume };
};