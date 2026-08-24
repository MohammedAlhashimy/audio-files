import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import vm from "node:vm";

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Usage: node scripts/extract-legacy-content.mjs <legacy.html>");

const projectRoot = resolve(dirname(new URL(import.meta.url).pathname), "..");
const source = readFileSync(resolve(sourcePath), "utf8");

function extractLiteral(marker, opening, closing) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing marker: ${marker}`);
  const start = source.indexOf(opening, markerIndex);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if (char === opening) depth += 1;
    if (char === closing) {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unclosed literal after ${marker}`);
}

function parseLiteral(literal) {
  return vm.runInNewContext(`(${literal})`, Object.create(null), {
    timeout: 2000,
    codeGeneration: { strings: false, wasm: false },
  });
}

function htmlToText(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/?b>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const legacyNotes = parseLiteral(extractLiteral("const questionNotes", "{", "}"));
const legacyQuiz = parseLiteral(extractLiteral("let quiz", "[", "]"));

const boundaries = [
  { id: "teil-1", start: 0, end: 145 },
  { id: "teil-2", start: 145, end: 280 },
  { id: "teil-3", start: 280, end: 307 },
  { id: "teil-4", start: 307, end: 337 },
];

function sectionForIndex(index) {
  const section = boundaries.find((item) => index >= item.start && index < item.end);
  if (!section) throw new Error(`No section for legacy index ${index + 1}`);
  return section;
}

const cards = legacyQuiz.map((legacyCard, globalIndex) => {
  const section = sectionForIndex(globalIndex);
  const order = globalIndex - section.start + 1;
  const prefix = `b1-${section.id}-${String(order).padStart(3, "0")}`;
  const rawPath = new URL(legacyCard.groupAudio).pathname.split("/main/")[1];
  const audioPath = rawPath === "AudioVier/18.mp4" ? "AudioVier/18.mp3" : rawPath;
  const transcript = htmlToText(legacyNotes[globalIndex + 1] ?? "");
  const questions = legacyCard.questions.map((question, questionIndex) => {
    const options = Array.from(question.options, String);
    const type = section.id === "teil-4"
      ? "statement-matching"
      : section.id === "teil-3" && options.length === 2
        ? "true-false"
        : "single-choice";
    return {
      id: `${prefix}-q${questionIndex + 1}`,
      type,
      prompt: String(question.q).trim(),
      options,
      correctAnswer: String(question.answer),
    };
  });
  return { id: prefix, level: "B1", section: section.id, order, audioPath, transcript, questions };
});

const errors = [];
const ids = new Set();
for (const card of cards) {
  if (ids.has(card.id)) errors.push(`Duplicate card id: ${card.id}`);
  ids.add(card.id);
  if (!card.transcript) errors.push(`Missing transcript: ${card.id}`);
  if (!card.audioPath.endsWith(".mp3")) errors.push(`Non-MP3 audio: ${card.id} -> ${card.audioPath}`);
  for (const question of card.questions) {
    if (ids.has(question.id)) errors.push(`Duplicate question id: ${question.id}`);
    ids.add(question.id);
    if (!question.options.includes(question.correctAnswer)) errors.push(`Answer not in options: ${question.id}`);
  }
}

const contentDir = resolve(projectRoot, "src/content/b1");
mkdirSync(contentDir, { recursive: true });
for (const boundary of boundaries) {
  const sectionCards = cards.filter((card) => card.section === boundary.id);
  const variableName = boundary.id.replace("-", "");
  const output = `import type { ListeningCard } from "../../types/exam";\n\nexport const ${variableName}Cards: ListeningCard[] = ${JSON.stringify(sectionCards, null, 2)};\n`;
  writeFileSync(resolve(contentDir, `${boundary.id}.ts`), output);
}

const report = {
  source: "Atefeh.HTML",
  cards: cards.length,
  questions: cards.reduce((total, card) => total + card.questions.length, 0),
  transcripts: cards.filter((card) => card.transcript).length,
  sections: Object.fromEntries(boundaries.map((boundary) => {
    const sectionCards = cards.filter((card) => card.section === boundary.id);
    return [boundary.id, { cards: sectionCards.length, questions: sectionCards.reduce((sum, card) => sum + card.questions.length, 0) }];
  })),
  convertedAudio: "AudioVier/18.mp4 -> AudioVier/18.mp3",
  errors,
};
mkdirSync(resolve(projectRoot, "reports"), { recursive: true });
writeFileSync(resolve(projectRoot, "reports/content-validation.json"), `${JSON.stringify(report, null, 2)}\n`);
if (errors.length) throw new Error(`Validation failed with ${errors.length} error(s)`);
console.log(JSON.stringify(report, null, 2));
