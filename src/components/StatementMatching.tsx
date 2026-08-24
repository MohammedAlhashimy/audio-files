import { CheckCircle2, XCircle } from "lucide-react";
import type { ListeningQuestion, SectionAnswers } from "../types/exam";

type Props = {
  questions: ListeningQuestion[];
  answers: SectionAnswers;
  onAssign: (questionId: string, option: string) => void;
};

export function StatementMatching({ questions, answers, onAssign }: Props) {
  const options = questions[0]?.options ?? [];

  return (
    <section className="matching-exercise" aria-labelledby="matching-title">
      <div className="matching-heading">
        <span className="prompt-label">Ordnen Sie jede Aussage einer passenden Antwort zu</span>
        <h2 id="matching-title">Wählen Sie neben jeder Antwort die passende Aussage.</h2>
      </div>

      <div className="matching-legend" aria-hidden="true">
        {questions.map((_, index) => <span key={index}>Aussage {index + 1}</span>)}
      </div>

      <div className="matching-options">
        {options.map((option, optionIndex) => (
          <div className="matching-row" key={option}>
            <span className="matching-letter">{String.fromCharCode(65 + optionIndex)}</span>
            <span className="matching-option-text">{option}</span>
            <div className="matching-assignments">
              {questions.map((question, questionIndex) => {
                const selected = answers[question.id] === option;
                const correct = selected && question.correctAnswer === option;
                const wrong = selected && question.correctAnswer !== option;
                return (
                  <button
                    key={question.id}
                    className={`matching-choice ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                    onClick={() => onAssign(question.id, option)}
                    aria-pressed={selected}
                    aria-label={`${option} Aussage ${questionIndex + 1} zuordnen`}
                  >
                    <span>{questionIndex + 1}</span>
                    {correct && <CheckCircle2 size={15} aria-hidden="true" />}
                    {wrong && <XCircle size={15} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
