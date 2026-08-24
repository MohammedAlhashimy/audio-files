import { ArrowRight, Check, Printer, RotateCcw, Trophy, X } from "lucide-react";
import type { ListeningCard, SectionAnswers } from "../types/exam";
import { formatTime } from "../utils/formatTime";

type Props = { cards: ListeningCard[]; answers: SectionAnswers; correctCount: number; answeredCount: number; totalQuestions: number; elapsed: number; onClose: () => void; onNavigate: (index: number) => void; onRestart: () => void };

export function ResultsModal({ cards, answers, correctCount, answeredCount, totalQuestions, elapsed, onClose, onNavigate, onRestart }: Props) {
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="result-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="result-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Ergebnis schließen"><X size={20} /></button>
        <div className="result-hero"><span className="trophy"><Trophy size={28} aria-hidden="true" /></span><span className="eyebrow">Sitzung abgeschlossen</span><h2 id="result-title">Ihr Ergebnis</h2><p>{correctCount} von {totalQuestions} Fragen richtig beantwortet</p></div>
        <div className="score-overview"><div className="score-circle"><span>{percentage}%</span></div><dl><div><dt>Beantwortet</dt><dd>{answeredCount}/{totalQuestions}</dd></div><div><dt>Richtig</dt><dd>{correctCount}</dd></div><div><dt>Zeit</dt><dd>{formatTime(elapsed)}</dd></div></dl></div>
        <div className="result-list">
          {cards.map((card, index) => {
            const correct = card.questions.every((question) => answers[question.id] === question.correctAnswer);
            const count = card.questions.filter((question) => answers[question.id]).length;
            return <button key={card.id} onClick={() => { onNavigate(index); onClose(); }}><span className={correct ? "result-icon correct" : "result-icon wrong"}>{correct ? <Check size={16} /> : <X size={16} />}</span><span><strong>Aufnahme {index + 1}</strong><small>{count}/{card.questions.length} beantwortet</small></span><ArrowRight size={17} aria-hidden="true" /></button>;
          })}
        </div>
        <div className="result-actions"><button className="secondary-button" onClick={() => window.print()}><Printer size={17} aria-hidden="true" /> Drucken</button><button className="primary-button" onClick={onRestart}><RotateCcw size={17} aria-hidden="true" /> Neu starten</button></div>
      </section>
    </div>
  );
}
