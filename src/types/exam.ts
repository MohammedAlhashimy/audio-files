export type B1SectionId = "teil-1" | "teil-2" | "teil-3" | "teil-4";

export type QuestionType =
  | "single-choice"
  | "true-false"
  | "statement-matching";

export type ListeningQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctAnswer: string;
};

export type ListeningCard = {
  id: string;
  level: "B1";
  section: B1SectionId;
  order: number;
  audioPath: string;
  transcript: string;
  questions: ListeningQuestion[];
};

export type B1Section = {
  id: B1SectionId;
  label: string;
  title: string;
  description: string;
  cardCount: number;
  questionCount: number;
};

export type SectionAnswers = Record<string, string>;
