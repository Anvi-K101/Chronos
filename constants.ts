import { DailyEntry } from './types';

export const MOOD_LABELS = {
  1: "Despair",
  3: "Low",
  5: "Neutral",
  7: "Content",
  10: "Ecstatic"
};

export const COMMON_EMOTIONS = [
  "Calm", "Anxious", "Energetic", "Tired", "Focused", "Distracted", 
  "Grateful", "Resentful", "Inspired", "Bored", "Confident", "Insecure",
  "Lonely", "Loved", "Overwhelmed", "Peaceful"
];

export const EMPTY_ENTRY: DailyEntry = {
  id: '',
  timestamp: Date.now(),
  state: {
    mood: null,
    descriptors: [],
    stress: null,
    anxiety: null,
    timesCried: 0,
    timesLaughed: 0,
    mentalClarity: null,
    physicalDiscomfort: ''
  },
  effort: {
    studyHours: {},
    workHours: 0,
    creativeHours: 0,
    sleepDuration: 0,
    sleepQuality: null,
    wakeTime: '',
    focusQuality: null
  },
  achievements: {
    dailyWins: '',
    academic: [],
    professional: [],
    breakthroughs: '',
    privatePride: '',
    failures: '',
    lessons: ''
  },
  reflections: {
    longForm: '',
    ideas: [],
    currentQuestions: [],
    changedMind: ''
  },
  memory: {
    happyMoments: '',
    sadMoments: '',
    peopleMet: '',
    placesVisited: '',
    conversations: '',
    media: ''
  },
  future: {
    gratitude: '',
    shortTermGoals: [],
    visionBoardText: '',
    lookingForward: '',
    wishes: ''
  }
};