import { Headphones } from "lucide-react";
import { useEffect, useState } from "react";
import { IntroScreen } from "./components/IntroScreen";
import { b1Sections, loadB1Section } from "./content/b1";
import { B1OverviewPage } from "./pages/B1OverviewPage";
import { B1TestPage } from "./pages/B1TestPage";
import type { B1SectionId, ListeningCard } from "./types/exam";

export default function App() {
  const [introVisible, setIntroVisible] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState<B1SectionId | null>(null);
  const [cards, setCards] = useState<ListeningCard[] | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveTimer = window.setTimeout(() => setIntroLeaving(true), reducedMotion ? 180 : 3900);
    const finishTimer = window.setTimeout(() => setIntroVisible(false), reducedMotion ? 260 : 4650);
    return () => { window.clearTimeout(leaveTimer); window.clearTimeout(finishTimer); };
  }, []);

  useEffect(() => {
    window.history.replaceState({ view: "b1-overview" }, "", "#b1");
    const onPopState = (event: PopStateEvent) => {
      const sectionId = event.state?.view === "b1-section" ? event.state.sectionId as B1SectionId : null;
      if (sectionId) {
        setSelectedSection(sectionId);
        setCards(null);
        void loadB1Section(sectionId).then(setCards);
      } else {
        setSelectedSection(null);
        setCards(null);
      }
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openSection = async (sectionId: B1SectionId) => {
    window.history.pushState({ view: "b1-section", sectionId }, "", `#b1/${sectionId}`);
    setSelectedSection(sectionId);
    setCards(null);
    setCards(await loadB1Section(sectionId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeSection = () => {
    if (window.history.state?.view === "b1-section") window.history.back();
    else { setSelectedSection(null); setCards(null); window.scrollTo({ top: 0 }); }
  };
  const section = b1Sections.find((item) => item.id === selectedSection);

  return (
    <>
      {!selectedSection && <B1OverviewPage onSelect={(id) => void openSection(id)} />}
      {selectedSection && section && cards && <B1TestPage key={selectedSection} section={section} cards={cards} onBack={closeSection} />}
      {selectedSection && !cards && <main className="app-shell loading-shell"><div className="loading-card glass-panel"><Headphones size={28} /><strong>{section?.label} wird geladen</strong><span>Inhalte werden vorbereitet …</span></div></main>}
      {introVisible && <IntroScreen leaving={introLeaving} />}
    </>
  );
}
