export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

export interface StudyMaterial {
  id: string;
  fileName: string;
  summary: string;
  quiz: QuizQuestion[];
  timestamp: number;
}

export type AppState = 'idle' | 'processing' | 'viewing';
