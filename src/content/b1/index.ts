import type { B1Section, B1SectionId, ListeningCard } from "../../types/exam";

export const b1Sections: B1Section[] = [
  { id: "teil-1", label: "Teil 1", title: "Kurze Ansagen", description: "Hören Sie eine kurze Aufnahme und wählen Sie die richtige Antwort.", cardCount: 145, questionCount: 145 },
  { id: "teil-2", label: "Teil 2", title: "Alltagssituationen", description: "Trainieren Sie das Verstehen von Informationen aus typischen Situationen.", cardCount: 135, questionCount: 135 },
  { id: "teil-3", label: "Teil 3", title: "Dialoge verstehen", description: "Beantworten Sie zu jedem Dialog eine Richtig/Falsch- und eine Auswahlfrage.", cardCount: 27, questionCount: 54 },
  { id: "teil-4", label: "Teil 4", title: "Meinungen zuordnen", description: "Ordnen Sie drei Aussagen den passenden Meinungen zu.", cardCount: 30, questionCount: 90 },
];

export async function loadB1Section(sectionId: B1SectionId): Promise<ListeningCard[]> {
  switch (sectionId) {
    case "teil-1": return (await import("./teil-1")).teil1Cards;
    case "teil-2": return (await import("./teil-2")).teil2Cards;
    case "teil-3": return (await import("./teil-3")).teil3Cards;
    case "teil-4": return (await import("./teil-4")).teil4Cards;
  }
}
