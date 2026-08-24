import { Check, Headphones, Sparkles, X } from "lucide-react";
import type { ListeningCard, SectionAnswers } from "../types/exam";

type Props = { cards: ListeningCard[]; answers: SectionAnswers; current: number; answeredCount: number; totalQuestions: number; onNavigate: (index: number) => void };

export function QuestionSidebar({ cards, answers, current, answeredCount, totalQuestions, onNavigate }: Props) {
  return (
    <aside className="sidebar glass-panel" aria-label="Sitzungsübersicht">
      <div className="course-badge"><span className="course-icon"><Headphones size={22} aria-hidden="true" /></span><div><span className="eyebrow">Hörverstehen</span><h2>{cards[0]?.section.replace("teil-", "Teil ")}</h2></div></div>
      <div className="session-copy"><p>Übungssitzung</p><strong>{answeredCount} von {totalQuestions} beantwortet</strong></div>
      <nav className="question-nav" aria-label="Aufnahmen">
        {cards.map((card, index) => {
          const selected = card.questions.filter((q) => answers[q.id]);
          const complete = selected.length === card.questions.length;
          const correct = complete && card.questions.every((q) => answers[q.id] === q.correctAnswer);
          const state = complete ? (correct ? "correct" : "wrong") : "open";
          return (
            <button key={card.id} className={`question-nav-item ${index === current ? "active" : ""}`} onClick={() => onNavigate(index)} aria-current={index === current ? "step" : undefined}>
              <span className={`question-number ${state}`}>{complete ? (correct ? <Check size={15} /> : <X size={15} />) : index + 1}</span>
              <span><strong>Aufnahme {index + 1}</strong><small>{complete ? (correct ? "Richtig" : "Noch einmal ansehen") : selected.length ? `${selected.length}/${card.questions.length} beantwortet` : "Offen"}</small></span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-tip"><Sparkles size={17} aria-hidden="true" /><p>Hören Sie zuerst vollständig zu und beantworten Sie danach alle Fragen.</p></div>
    </aside>
  );
}
