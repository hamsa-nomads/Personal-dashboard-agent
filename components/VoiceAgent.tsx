"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Bot, Mic, MicOff, Send, Volume2, X } from "lucide-react";

export type AgentMessage = { role: "user" | "agent"; text: string };
type Props = { open: boolean; onClose: () => void; onCommand: (text: string) => string };

export default function VoiceAgent({ open, onClose, onCommand }: Props) {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [messages, setMessages] = useState<AgentMessage[]>([{ role: "agent", text: "I am the free on-device Dayframe coach. Ask what to do next, replan the day, start focus, finish a task, or add a task." }]);
  const lastTranscript = useRef("");
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } = useSpeechRecognition();

  useEffect(() => {
    if (!listening && transcript.trim() && transcript !== lastTranscript.current) { lastTranscript.current = transcript; submitText(transcript); resetTranscript(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, transcript]);
  useEffect(() => { if (!open && listening) SpeechRecognition.abortListening(); }, [open, listening]);

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text); utterance.lang = language; utterance.rate = 1; window.speechSynthesis.speak(utterance);
  }
  function submitText(raw: string) {
    const text = raw.trim(); if (!text) return;
    const response = onCommand(text);
    setMessages((current) => [...current, { role: "user", text }, { role: "agent", text: response }]); setInput(""); speak(response);
  }
  function handleSubmit(event: FormEvent) { event.preventDefault(); submitText(input); }
  async function toggleListening() {
    if (listening) { await SpeechRecognition.stopListening(); return; }
    resetTranscript(); lastTranscript.current = ""; await SpeechRecognition.startListening({ continuous: false, language });
  }
  if (!open) return null;
  return <div className="agent-backdrop" onClick={onClose}><section className="agent-panel" onClick={(event) => event.stopPropagation()} aria-label="Dayframe voice coach">
    <header className="agent-header"><div className="agent-title"><span><Bot size={21} /></span><div><strong>Dayframe coach</strong><small>Local commands · no paid AI API</small></div></div><button className="agent-close" onClick={onClose} aria-label="Close voice coach"><X /></button></header>
    <div className="agent-messages">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`agent-message ${message.role}`}>{message.text}</div>)}</div>
    <div className="agent-voice-row"><button className={`voice-orb ${listening ? "listening" : ""}`} onClick={toggleListening} disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable}>{listening ? <MicOff /> : <Mic />}</button><div><strong>{listening ? "Listening…" : browserSupportsSpeechRecognition ? "Tap to speak" : "Voice input unavailable"}</strong><p>{browserSupportsSpeechRecognition ? "Your browser transcribes the command; Dayframe executes it locally." : "Type below. Voice output still works when supported."}</p></div><select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Voice language"><option value="en-US">English</option><option value="fr-FR">Français</option></select></div>
    <form className="agent-compose" onSubmit={handleSubmit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="What should I do next?" /><button type="button" title="Read latest response" onClick={() => speak(messages.filter((message) => message.role === "agent").at(-1)?.text ?? "")}><Volume2 size={18} /></button><button type="submit" className="primary"><Send size={18} /></button></form>
  </section></div>;
}
