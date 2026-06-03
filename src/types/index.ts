export type Subject = 'Science' | 'Mathematics' | 'Social Science' | 'English';

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: Subject;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: Subject;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudySession {
  id: string;
  date: string;
  subject: Subject;
  topic: string;
  duration: number; // in minutes
  completed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StudyResource {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  subject: Subject;
  content: string;
  uploadedAt: number;
}

export interface PracticeVariant {
  question: string;
  answer: string;
}

export interface GsebPYQ {
  id: string;
  year: string;
  marks: number;
  question: string;
  answer: string;
  chapterId: string;
  subject: Subject;
  variations: PracticeVariant[];
  isCustom?: boolean;
}


