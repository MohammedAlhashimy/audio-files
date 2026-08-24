import { Clock3 } from "lucide-react";
import { formatTime } from "../utils/formatTime";

type ProgressHeaderProps = {
  progress: number;
  elapsed: number;
};

export function ProgressHeader({ progress, elapsed }: ProgressHeaderProps) {
  return (
    <header className="topbar glass-panel">
      <a className="brand" href="#main-question" aria-label="ATEFEH Startseite">
        <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
        <span className="brand-copy"><strong>ATEFEH</strong><small>Deutsch Hörtrainer</small></span>
      </a>
      <div className="top-progress" aria-label={`${Math.round(progress)} Prozent abgeschlossen`}>
        <span>{Math.round(progress)}% abgeschlossen</span>
        <div className="top-progress-track"><span style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="timer" aria-label={`Bearbeitungszeit ${formatTime(elapsed)}`}>
        <Clock3 size={17} aria-hidden="true" /><span>{formatTime(elapsed)}</span>
      </div>
    </header>
  );
}
