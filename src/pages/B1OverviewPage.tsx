import { ArrowRight, CheckCircle2, Headphones, Layers3, MessageSquareText, Radio, RotateCcw } from "lucide-react";
import { useState } from "react";
import { b1Sections } from "../content/b1";
import type { B1SectionId } from "../types/exam";
import { clearSectionProgress, sectionCompletion } from "../utils/progress";

const icons = [Radio, Headphones, MessageSquareText, Layers3];

type B1OverviewPageProps = { onSelect: (sectionId: B1SectionId) => void };

export function B1OverviewPage({ onSelect }: B1OverviewPageProps) {
  const [, refreshProgress] = useState(0);

  const resetSection = (sectionId: B1SectionId, label: string) => {
    const confirmed = window.confirm(`Möchten Sie wirklich alle Antworten und den Fortschritt von ${label} zurücksetzen?`);
    if (!confirmed) return;
    clearSectionProgress(sectionId);
    refreshProgress((value) => value + 1);
  };

  return (
    <main className="app-shell overview-shell">
      <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
      <div className="app-frame overview-frame">
        <header className="topbar glass-panel overview-topbar">
          <a className="brand" href="#b1-sections" aria-label="ATEFEH B1"><span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span><span className="brand-copy"><strong>ATEFEH</strong><small>Deutsch Hörtrainer</small></span></a>
          <span className="level-pill">Niveau B1</span>
        </header>
        <section className="overview-hero">
          <span className="eyebrow">Deutsch · Hörverstehen</span>
          <h1>B1 Hörtraining</h1>
          <p>Wählen Sie einen Teil und trainieren Sie mit vollständigen Hörtexten, Fragen und direkter Auswertung.</p>
          <div className="overview-summary"><span><CheckCircle2 size={17} /> 337 Aufnahmen</span><span><CheckCircle2 size={17} /> 424 Fragen</span><span><CheckCircle2 size={17} /> 4 Prüfungsteile</span></div>
        </section>
        <section className="section-grid" id="b1-sections" aria-label="B1 Prüfungsteile">
          {b1Sections.map((section, index) => {
            const Icon = icons[index];
            const completion = sectionCompletion(section.id, section.questionCount);
            return (
              <article className="section-card glass-panel" key={section.id}>
                <div className="section-card-head"><span className={`section-card-icon tone-${index + 1}`}><Icon size={25} /></span><span className="section-index">0{index + 1}</span></div>
                <span className="eyebrow">{section.label}</span><h2>{section.title}</h2><p>{section.description}</p>
                <dl><div><dt>Aufnahmen</dt><dd>{section.cardCount}</dd></div><div><dt>Fragen</dt><dd>{section.questionCount}</dd></div></dl>
                <div className="section-progress"><span><strong>{completion}%</strong> abgeschlossen</span><div><span style={{ width: `${completion}%` }} /></div></div>
                <div className="section-actions">
                  <button className="secondary-button section-reset" onClick={() => resetSection(section.id, section.label)} disabled={!completion} aria-label={`${section.label} zurücksetzen`} title="Fortschritt zurücksetzen"><RotateCcw size={17} /><span>Zurücksetzen</span></button>
                  <button className="primary-button section-start" onClick={() => onSelect(section.id)}>{completion ? "Fortsetzen" : "Teil öffnen"} <ArrowRight size={18} /></button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
