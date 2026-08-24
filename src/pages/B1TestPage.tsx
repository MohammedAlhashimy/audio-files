import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, Clock3, Copy, FileText, Flag, Hash, Lightbulb, Pause, Play, RotateCcw, Volume2, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProgressHeader } from "../components/ProgressHeader";
import { QuestionSidebar } from "../components/QuestionSidebar";
import { ResultsModal } from "../components/ResultsModal";
import { StatementMatching } from "../components/StatementMatching";
import { getAudioUrl } from "../config/audio";
import type { B1Section, ListeningCard, SectionAnswers } from "../types/exam";
import { formatTime } from "../utils/formatTime";
import { clearSectionProgress, loadSectionProgress, saveSectionProgress } from "../utils/progress";

const wavePattern = [32, 48, 70, 43, 84, 58, 36, 66, 91, 52, 74, 39, 62, 88, 46, 69, 35, 80, 55, 42, 73, 94, 61, 37, 68, 49, 83, 57, 34, 72, 50, 87];

type Props = { section: B1Section; cards: ListeningCard[]; onBack: () => void };

export function B1TestPage({ section, cards, onBack }: Props) {
  const saved = useMemo(() => loadSectionProgress(section.id), [section.id]);
  const [current, setCurrent] = useState(() => Math.min(saved.current, cards.length - 1));
  const [answers, setAnswers] = useState<SectionAnswers>(() => saved.answers);
  const [elapsed, setElapsed] = useState(() => saved.elapsed);
  const [finished, setFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [liveWave, setLiveWave] = useState<number[] | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const visualFrameRef = useRef<number | null>(null);
  const startedAt = useRef(Date.now() - saved.elapsed * 1000);
  const card = cards[current];
  const totalQuestions = useMemo(() => cards.reduce((sum, item) => sum + item.questions.length, 0), [cards]);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const correctCount = useMemo(() => cards.reduce((sum, item) => sum + item.questions.filter((q) => answers[q.id] === q.correctAnswer).length, 0), [answers, cards]);

  const notify = useCallback((message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200); }, []);
  const goToCard = useCallback((index: number) => { if (index >= 0 && index < cards.length) { setCurrent(index); setJumpOpen(false); } }, [cards.length]);

  useEffect(() => {
    if (finished) return;
    const update = () => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    saveSectionProgress(section.id, { current, elapsed, answers });
  }, [answers, current, elapsed, section.id]);

  useEffect(() => {
    const audio = audioRef.current; if (!audio) return;
    audio.pause(); audio.currentTime = 0; setIsPlaying(false); setAudioTime(0); setAudioDuration(0); setTranscriptOpen(false); setLiveWave(null);
  }, [current]);

  const stopVisualization = useCallback(() => {
    if (visualFrameRef.current !== null) {
      window.cancelAnimationFrame(visualFrameRef.current);
      visualFrameRef.current = null;
    }
    setLiveWave(null);
  }, []);

  const startVisualization = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioContextConstructor();
      const context = audioContextRef.current;
      if (!analyserRef.current) {
        const analyser = context.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.78;
        analyserRef.current = analyser;
      }
      if (!sourceRef.current) {
        sourceRef.current = context.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(context.destination);
      }
      await context.resume();
      stopVisualization();
      const frequencies = new Uint8Array(analyserRef.current.frequencyBinCount);
      let lastRender = 0;
      const draw = (timestamp: number) => {
        const analyser = analyserRef.current;
        if (!analyser) return;
        analyser.getByteFrequencyData(frequencies);
        if (timestamp - lastRender > 65) {
          lastRender = timestamp;
          setLiveWave(wavePattern.map((_, index) => {
            const sourceIndex = Math.min(frequencies.length - 1, Math.floor((index / wavePattern.length) * frequencies.length));
            return Math.max(14, Math.min(94, (frequencies[sourceIndex] / 255) * 94));
          }));
        }
        visualFrameRef.current = window.requestAnimationFrame(draw);
      };
      visualFrameRef.current = window.requestAnimationFrame(draw);
    } catch { setLiveWave(null); }
  }, [stopVisualization]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current; if (!audio) return;
    if (audio.paused) audio.play().catch(() => notify("Audio konnte nicht abgespielt werden")); else audio.pause();
  }, [notify]);

  useEffect(() => () => {
    if (visualFrameRef.current !== null) window.cancelAnimationFrame(visualFrameRef.current);
    void audioContextRef.current?.close();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement; if (target.matches("input, textarea, button")) return;
      if (event.key === "ArrowRight") goToCard(current + 1);
      if (event.key === "ArrowLeft") goToCard(current - 1);
      if (event.key === " ") { event.preventDefault(); togglePlay(); }
      if (event.key === "Escape") { setResultsOpen(false); setJumpOpen(false); }
    };
    window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, goToCard, togglePlay]);

  const chooseAnswer = (questionId: string, answer: string) => { if (!answers[questionId]) setAnswers((previous) => ({ ...previous, [questionId]: answer })); };
  const assignStatement = (questionId: string, option: string) => {
    setAnswers((previous) => {
      const next = { ...previous };
      card.questions.forEach((question) => {
        if (question.id !== questionId && next[question.id] === option) delete next[question.id];
      });
      next[questionId] = option;
      return next;
    });
  };
  const resetCurrent = () => { setAnswers((previous) => { const next = { ...previous }; card.questions.forEach((q) => delete next[q.id]); return next; }); notify("Antworten zurückgesetzt"); };
  const restartQuiz = () => { clearSectionProgress(section.id); setAnswers({}); setCurrent(0); setElapsed(0); setFinished(false); setResultsOpen(false); startedAt.current = Date.now(); notify("Neue Runde gestartet"); };
  const copyText = async (text: string, success: string) => { try { await navigator.clipboard.writeText(text); notify(success); } catch { notify("Kopieren fehlgeschlagen"); } };
  const copyCard = () => void copyText(card.questions.map((q) => `Frage: ${q.prompt}\n${q.options.map((option, i) => `${String.fromCharCode(65 + i)}. ${option}`).join("\n")}`).join("\n\n"), "Fragen kopiert");
  const seek = (clientX: number, element: HTMLDivElement) => {
    const audio = audioRef.current; if (!audio?.duration) return;
    const box = element.getBoundingClientRect();
    const nextTime = Math.max(0, Math.min(1, (clientX - box.left) / box.width)) * audio.duration;
    audio.currentTime = nextTime;
    setAudioTime(nextTime);
  };
  const hasCurrentAnswers = card.questions.some((q) => answers[q.id]);

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
      <div className="app-frame">
        <ProgressHeader progress={progress} elapsed={elapsed} />
        <div className="workspace">
          <QuestionSidebar cards={cards} answers={answers} current={current} answeredCount={answeredCount} totalQuestions={totalQuestions} onNavigate={goToCard} />
          <section className="question-card glass-panel" id="main-question">
            <button className="mobile-overview-back" onClick={onBack}><ArrowLeft size={16} /> B1 Übersicht</button>
            <div className="question-toolbar">
              <div><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> B1 Übersicht</button><span className="eyebrow">{section.label} · Hörverstehen</span><h1>Aufnahme {current + 1} <span>von {cards.length}</span></h1></div>
              <div className="toolbar-actions"><button className="icon-button" onClick={() => setJumpOpen((open) => !open)} aria-label="Zu einer Aufnahme springen" aria-expanded={jumpOpen}><Hash size={19} /></button><button className="icon-button" onClick={() => void copyText(card.transcript, "Transkript kopiert")} aria-label="Transkript kopieren"><Copy size={18} /></button></div>
            </div>

            <div className="audio-player">
              <div className="audio-meta"><span><Volume2 size={17} /> Aufnahme {current + 1}</span><div className="audio-utilities"><button className="audio-copy-button" onClick={copyCard} aria-label="Fragen kopieren"><Copy size={17} /></button><button className="question-picker" onClick={() => setJumpOpen((open) => !open)} aria-expanded={jumpOpen}>Aufnahme {current + 1}/{cards.length} <ChevronDown size={16} /></button><span className="audio-session-time"><Clock3 size={17} /> {formatTime(elapsed)}</span></div></div>
              <div className="audio-controls"><button className="play-button" onClick={togglePlay} aria-label={isPlaying ? "Audio pausieren" : "Audio abspielen"}>{isPlaying ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" />}</button><div className="audio-content"><div
                className={`waveform ${isPlaying ? "live" : ""} ${isSeeking ? "seeking" : ""}`}
                onPointerDown={(event) => { setIsSeeking(true); event.currentTarget.setPointerCapture(event.pointerId); seek(event.clientX, event.currentTarget); }}
                onPointerMove={(event) => { if (isSeeking) seek(event.clientX, event.currentTarget); }}
                onPointerUp={(event) => { setIsSeeking(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
                onPointerCancel={() => setIsSeeking(false)}
                onKeyDown={(event) => {
                  const audio = audioRef.current;
                  if (!audio?.duration || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
                  event.preventDefault(); event.stopPropagation();
                  audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + (event.key === "ArrowRight" ? 5 : -5)));
                }}
                role="slider" tabIndex={0} aria-label="Audioposition – zum Spulen ziehen" aria-valuemin={0} aria-valuemax={Math.round(audioDuration)} aria-valuenow={Math.round(audioTime)} aria-valuetext={`${formatTime(audioTime)} von ${formatTime(audioDuration)}`}
              >{wavePattern.map((height, index) => <span key={index} style={{ height: `${liveWave?.[index] ?? height}%` }} />)}</div><span className="audio-position">{formatTime(audioTime)} / {formatTime(audioDuration)}</span></div></div>
              <audio ref={audioRef} src={getAudioUrl(card.audioPath)} crossOrigin="anonymous" preload="metadata" onPlay={() => { setIsPlaying(true); void startVisualization(); }} onPause={() => { setIsPlaying(false); stopVisualization(); }} onEnded={() => { setIsPlaying(false); stopVisualization(); }} onTimeUpdate={(event) => setAudioTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration)} onError={() => notify("Aufnahme konnte nicht geladen werden")} />
            </div>

            {jumpOpen && <div className="jump-panel" role="dialog" aria-label="Aufnahme auswählen"><span>Direkt zu</span><div className="jump-grid">{cards.map((_, index) => <button key={index} className={index === current ? "active" : ""} onClick={() => goToCard(index)}>{index + 1}</button>)}</div></div>}

            <div className="transcript-section"><button className="transcript-toggle" onClick={() => setTranscriptOpen((open) => !open)} aria-expanded={transcriptOpen}><span><FileText size={18} /> Transkript anzeigen</span><span>{transcriptOpen ? "Ausblenden" : "Öffnen"}</span></button>{transcriptOpen && <div className="transcript-copy"><div className="transcript-head"><strong>Text zu Aufnahme {current + 1}</strong><button className="copy-compact" onClick={() => void copyText(card.transcript, "Transkript kopiert")}><Copy size={14} /> Kopieren</button></div>{card.transcript.split("\n\n").map((paragraph, index) => <p key={`${card.id}-${index}`}>{paragraph}</p>)}</div>}</div>

            {section.id !== "teil-4" && <div className="prompt-block"><span className="prompt-label">Wählen Sie die richtige Antwort</span>{card.questions.length === 1 && <h2>{card.questions[0].prompt}</h2>}</div>}
            {section.id === "teil-4" ? <StatementMatching questions={card.questions} answers={answers} onAssign={assignStatement} /> : <div className="question-groups">
              {card.questions.map((question, questionIndex) => {
                const selected = answers[question.id];
                return <section className={`question-group ${card.questions.length === 1 ? "single-question" : ""}`} key={question.id}>{card.questions.length > 1 && <h3>{questionIndex + 1}. {question.prompt}</h3>}<div className="answer-list" role="radiogroup" aria-label={question.prompt}>{question.options.map((option, index) => { const correct = Boolean(selected) && option === question.correctAnswer; const wrong = selected === option && option !== question.correctAnswer; return <button key={option} className={`answer-option ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`} onClick={() => chooseAnswer(question.id, option)} disabled={Boolean(selected)} role="radio" aria-checked={selected === option}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span className="answer-text">{option}</span><span className="answer-status">{correct && <CheckCircle2 size={22} />}{wrong && <XCircle size={22} />}</span></button>; })}</div>{selected && <div className={`feedback ${selected === question.correctAnswer ? "success" : "error"}`} role="status">{selected === question.correctAnswer ? <CheckCircle2 size={20} /> : <Lightbulb size={20} />}<p><strong>{selected === question.correctAnswer ? "Sehr gut!" : "Fast – prüfen Sie die markierte Lösung."}</strong><span>{selected === question.correctAnswer ? "Ihre Antwort ist richtig." : `Richtig ist: ${question.correctAnswer}`}</span></p></div>}</section>;
              })}
            </div>}

            <footer className="question-footer"><button className="secondary-button reset-button" onClick={resetCurrent} disabled={!hasCurrentAnswers}><RotateCcw size={17} /> Zurücksetzen</button><div className="nav-buttons"><button className="secondary-button square-on-mobile" onClick={() => goToCard(current - 1)} disabled={current === 0}><ArrowLeft size={18} /><span>Zurück</span></button>{current < cards.length - 1 ? <button className="primary-button" onClick={() => goToCard(current + 1)}>Weiter <ArrowRight size={18} /></button> : <button className="primary-button finish-button" onClick={() => { setFinished(true); setResultsOpen(true); }}>Beenden <Flag size={17} /></button>}</div></footer>
          </section>
        </div>
      </div>
      {resultsOpen && <ResultsModal cards={cards} answers={answers} correctCount={correctCount} answeredCount={answeredCount} totalQuestions={totalQuestions} elapsed={elapsed} onClose={() => setResultsOpen(false)} onNavigate={goToCard} onRestart={restartQuiz} />}
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite"><Check size={16} /> {toast}</div>
    </main>
  );
}
