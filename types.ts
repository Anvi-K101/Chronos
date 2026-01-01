export type RatingScale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// A. Daily State
export interface DailyState {
  mood: RatingScale | null; 
  descriptors: string[];
  stress: RatingScale | null;
  anxiety: RatingScale | null;
  timesCried: number;
  timesLaughed: number;
  mentalClarity: RatingScale | null;
  physicalDiscomfort: string;
}

// B. Time & Effort
export interface TimeEffort {
  studyHours: Record<string, number>; 
  workHours: number;
  creativeHours: number;
  sleepDuration: number;
  sleepQuality: RatingScale | null;
  wakeTime: string; 
  focusQuality: RatingScale | null;
}

// C. Achievements
export interface Achievements {
  dailyWins: string;
  academic: string[];
  professional: string[];
  breakthroughs: string; 
  privatePride: string;
  failures: string; 
  lessons: string;
}

// D. Reflection (Daily)
export interface Reflections {
  longForm: string;
  ideas: string[];
  currentQuestions: string[];
  changedMind: string;
}

// E. Memory
export interface Memory {
  happyMoments: string;
  sadMoments: string;
  peopleMet: string;
  placesVisited: string;
  conversations: string;
  media: string;
}

// F. Future & Gratitude
export interface Future {
  gratitude: string;
  shortTermGoals: { id: string; text: string; done: boolean }[];
  visionBoardText: string;
  lookingForward: string;
  wishes: string;
}

// Master Entry Object
export interface DailyEntry {
  id: string; // YYYY-MM-DD
  timestamp: number; 
  state: DailyState;
  effort: TimeEffort;
  achievements: Achievements;
  reflections: Reflections;
  memory: Memory;
  future: Future;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created: number;
  updated: number;
  tags: string[];
  versions?: { date: number; content: string }[];
}

// App Settings / Metadata
export interface AppData {
  entries: Record<string, DailyEntry>;
  principles: Note[]; 
  essays: Note[];
}