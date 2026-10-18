import { useEffect, useState, useRef } from "react";
import { AppState } from "react-native";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
export function useVoice(onAnswer: (text: string) => void) {
  const [activity, setActivity] = useState<"idle" | "speaking" | "listening">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const active = useRef(false);
  const generation = useRef(0);
  const speechStopped = useRef<Promise<void>>(Promise.resolve());
  const recognitionEnded = useRef<Promise<void>>(Promise.resolve());
  const finishRecognition = useRef<(() => void) | null>(null);
  function stop() {
    const wasListening = active.current;
    active.current = false;
    generation.current++;
    if (wasListening) {
      recognitionEnded.current = new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          finishRecognition.current = null;
          resolve();
        }, 1500);
        finishRecognition.current = () => {
          clearTimeout(timeout);
          finishRecognition.current = null;
          resolve();
        };
      });
      ExpoSpeechRecognitionModule.abort();
    }
    speechStopped.current = Speech.stop().catch(() => undefined);
    setActivity("idle");
  }
  useSpeechRecognitionEvent("result", (event) => {
    if (active.current && event.isFinal) {
      const transcript = event.results[0]?.transcript ?? "";
      setMessage(`Heard: “${transcript}”`);
      onAnswer(transcript);
    }
  });
  useSpeechRecognitionEvent("end", () => {
    finishRecognition.current?.();
    if (!active.current) return;
    active.current = false;
    setActivity("idle");
  });
  useSpeechRecognitionEvent("error", (event) => {
    finishRecognition.current?.();
    if (!active.current) return;
    active.current = false;
    setActivity("idle");
    if (event.error !== "aborted")
      setMessage("Voice unavailable. Please select your answer on screen.");
  });
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") stop();
    });
    return () => {
      sub.remove();
      stop();
    };
  }, []);
  async function read(text: string) {
    stop();
    const id = generation.current;
    await Promise.all([speechStopped.current, recognitionEnded.current]);
    if (id !== generation.current) return;
    setMessage("");
    setActivity("speaking");
    Speech.speak(text, {
      language: "en-US",
      onDone: () => {
        if (id === generation.current) setActivity("idle");
      },
      onStopped: () => {
        if (id === generation.current) setActivity("idle");
      },
      onError: () => {
        if (id === generation.current) {
          setActivity("idle");
          setMessage("Reading unavailable. Check installed device voices.");
        }
      },
    });
  }
  async function listen() {
    stop();
    const id = generation.current;
    try {
      await Promise.all([speechStopped.current, recognitionEnded.current]);
      if (id !== generation.current) return;
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (id !== generation.current) return;
      if (!permission.granted) {
        setMessage(
          "Microphone and speech permissions are needed for voice answers.",
        );
        return;
      }
      active.current = true;
      setMessage("");
      setActivity("listening");
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: false,
        continuous: false,
      });
    } catch {
      active.current = false;
      setActivity("idle");
      setMessage("Speech recognition is unavailable on this device.");
    }
  }
  return { activity, message, stop, read, listen };
}
