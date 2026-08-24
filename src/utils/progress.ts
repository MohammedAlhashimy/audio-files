import type { B1SectionId, SectionAnswers } from "../types/exam";

export type SavedSectionProgress = {
  current: number;
  elapsed: number;
  answers: SectionAnswers;
};

const emptyProgress: SavedSectionProgress = { current: 0, elapsed: 0, answers: {} };
const storageKey = (sectionId: B1SectionId) => `atefeh:b1:${sectionId}:progress`;

export function loadSectionProgress(sectionId: B1SectionId): SavedSectionProgress {
  try {
    const raw = window.localStorage.getItem(storageKey(sectionId));
    if (!raw) return emptyProgress;
    const saved = JSON.parse(raw) as Partial<SavedSectionProgress>;
    return {
      current: Number.isInteger(saved.current) && Number(saved.current) >= 0 ? Number(saved.current) : 0,
      elapsed: Number.isFinite(saved.elapsed) && Number(saved.elapsed) >= 0 ? Number(saved.elapsed) : 0,
      answers: saved.answers && typeof saved.answers === "object" ? saved.answers : {},
    };
  } catch { return emptyProgress; }
}

export function saveSectionProgress(sectionId: B1SectionId, progress: SavedSectionProgress) {
  try { window.localStorage.setItem(storageKey(sectionId), JSON.stringify(progress)); } catch { /* Storage can be unavailable in private mode. */ }
}

export function clearSectionProgress(sectionId: B1SectionId) {
  try { window.localStorage.removeItem(storageKey(sectionId)); } catch { /* Storage can be unavailable in private mode. */ }
}

export function sectionCompletion(sectionId: B1SectionId, totalQuestions: number) {
  const answered = Object.keys(loadSectionProgress(sectionId).answers).length;
  return Math.min(100, Math.round((answered / totalQuestions) * 100));
}
