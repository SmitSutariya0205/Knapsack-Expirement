/**
 * Participant Question Loader
 * Implements the same logic as generate-participant-questions.ts
 * but loads and organizes questions dynamically in the frontend
 */

import staticQuestions from './static-questions.json';
import { NUM_BALLS } from './config';

export interface Ball {
  id: number;
  weight: number;
  reward: number;
  color: string;
}

export interface Question {
  id: number;
  capacity: number;
  balls: Ball[];
  solution?: number[];
  explanation?: string;
  difficulty?: string;
  phase?: string;
  metadata?: {
    dominanceCount: number;
    slackRatio: number;
    optimalityGap: number;
    densityVariance: number;
  };
}

interface QuestionSet {
  easy: Question[];
  medium: Question[];
  hard: Question[];
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Load questions for a specific phase and difficulty
 */
function loadQuestionsForPhase(phase: 'training' | 'benchmark' | 'prediction'): QuestionSet {
  const phaseQuestions = (staticQuestions.questions as Question[]).filter(
    (q) => q.phase === phase && q.balls.length === NUM_BALLS
  );

  return {
    easy: phaseQuestions.filter(q => q.difficulty === 'easy'),
    medium: phaseQuestions.filter(q => q.difficulty === 'medium'),
    hard: phaseQuestions.filter(q => q.difficulty === 'hard')
  };
}

/**
 * Randomize question order using weighted random selection
 */
function randomizeQuestionOrder(
  easyQuestions: Question[],
  mediumQuestions: Question[],
  hardQuestions: Question[],
  easyCount: number,
  mediumCount: number,
  hardCount: number
): Question[] {
  const shuffledEasy = shuffle(easyQuestions);
  const shuffledMedium = shuffle(mediumQuestions);
  const shuffledHard = shuffle(hardQuestions);

  const result: Question[] = [];
  let easyIndex = 0;
  let mediumIndex = 0;
  let hardIndex = 0;
  let eRemaining = easyCount;
  let mRemaining = mediumCount;
  let hRemaining = hardCount;

  const total = easyCount + mediumCount + hardCount;

  for (let i = 0; i < total; i++) {
    const totalRemaining = eRemaining + mRemaining + hRemaining;
    const rand = Math.random() * totalRemaining;

    if (rand < eRemaining && easyIndex < shuffledEasy.length) {
      result.push(shuffledEasy[easyIndex++]);
      eRemaining--;
    } else if (rand < eRemaining + mRemaining && mediumIndex < shuffledMedium.length) {
      result.push(shuffledMedium[mediumIndex++]);
      mRemaining--;
    } else if (hardIndex < shuffledHard.length) {
      result.push(shuffledHard[hardIndex++]);
      hRemaining--;
    } else if (easyIndex < shuffledEasy.length) {
      result.push(shuffledEasy[easyIndex++]);
      eRemaining--;
    } else if (mediumIndex < shuffledMedium.length) {
      result.push(shuffledMedium[mediumIndex++]);
      mRemaining--;
    }
  }

  return result;
}

/**
 * Get practice questions (hardcoded 6 questions: 2 easy + 2 medium + 2 hard)
 */
export function getPracticeQuestions(): Question[] {
  const practiceQuestions: Question[] = [
    // Easy 1: capacity=14, optimal=[1,2,3,4], weight=14, reward=47
    {
      "id": 1,
      "capacity": 14,
      "balls": [
        { "id": 1, "weight": 2, "reward": 10, "color": "bg-red-500" },
        { "id": 2, "weight": 3, "reward": 12, "color": "bg-blue-500" },
        { "id": 3, "weight": 4, "reward": 11, "color": "bg-green-500" },
        { "id": 4, "weight": 5, "reward": 14, "color": "bg-yellow-500" },
        { "id": 5, "weight": 7, "reward": 6, "color": "bg-purple-500" },
        { "id": 6, "weight": 9, "reward": 4, "color": "bg-pink-500" }
      ],
      "solution": [1, 2, 3, 4],
      "explanation": "Select balls 1, 2, 3 and 4 for weight 14 (= capacity) and maximum reward of 47.",
      "difficulty": "easy",
      "phase": "training"
    },
    // Easy 2: capacity=15, optimal=[1,2,3,4], weight=15, reward=51
    {
      "id": 2,
      "capacity": 15,
      "balls": [
        { "id": 1, "weight": 2, "reward": 11, "color": "bg-red-500" },
        { "id": 2, "weight": 3, "reward": 13, "color": "bg-blue-500" },
        { "id": 3, "weight": 4, "reward": 12, "color": "bg-green-500" },
        { "id": 4, "weight": 6, "reward": 15, "color": "bg-yellow-500" },
        { "id": 5, "weight": 8, "reward": 7, "color": "bg-purple-500" },
        { "id": 6, "weight": 10, "reward": 5, "color": "bg-pink-500" }
      ],
      "solution": [1, 2, 3, 4],
      "explanation": "Select balls 1, 2, 3 and 4 for weight 15 (= capacity) and maximum reward of 51.",
      "difficulty": "easy",
      "phase": "training"
    },
    // Medium 1: capacity=21, optimal=[1,2,3,4], weight=21, reward=63
    {
      "id": 3,
      "capacity": 21,
      "balls": [
        { "id": 1, "weight": 3, "reward": 15, "color": "bg-red-500" },
        { "id": 2, "weight": 5, "reward": 18, "color": "bg-blue-500" },
        { "id": 3, "weight": 6, "reward": 16, "color": "bg-green-500" },
        { "id": 4, "weight": 7, "reward": 14, "color": "bg-yellow-500" },
        { "id": 5, "weight": 8, "reward": 5, "color": "bg-purple-500" },
        { "id": 6, "weight": 4, "reward": 13, "color": "bg-pink-500" }
      ],
      "solution": [1, 2, 3, 4],
      "explanation": "Select balls 1, 2, 3 and 4 for weight 21 (= capacity) and maximum reward of 63.",
      "difficulty": "medium",
      "phase": "training"
    },
    // Medium 2: capacity=20, optimal=[1,2,3,4], weight=20, reward=60
    {
      "id": 4,
      "capacity": 20,
      "balls": [
        { "id": 1, "weight": 3, "reward": 14, "color": "bg-red-500" },
        { "id": 2, "weight": 4, "reward": 16, "color": "bg-blue-500" },
        { "id": 3, "weight": 5, "reward": 13, "color": "bg-green-500" },
        { "id": 4, "weight": 8, "reward": 17, "color": "bg-yellow-500" },
        { "id": 5, "weight": 9, "reward": 6, "color": "bg-purple-500" },
        { "id": 6, "weight": 11, "reward": 4, "color": "bg-pink-500" }
      ],
      "solution": [1, 2, 3, 4],
      "explanation": "Select balls 1, 2, 3 and 4 for weight 20 (= capacity) and maximum reward of 60.",
      "difficulty": "medium",
      "phase": "training"
    },
    // Hard 1: capacity=24, optimal=[1,2,3,4], weight=24, reward=66
    {
      "id": 5,
      "capacity": 24,
      "balls": [
        { "id": 1, "weight": 4, "reward": 18, "color": "bg-red-500" },
        { "id": 2, "weight": 5, "reward": 17, "color": "bg-blue-500" },
        { "id": 3, "weight": 6, "reward": 16, "color": "bg-green-500" },
        { "id": 4, "weight": 9, "reward": 15, "color": "bg-yellow-500" },
        { "id": 5, "weight": 7, "reward": 10, "color": "bg-purple-500" },
        { "id": 6, "weight": 3, "reward": 12, "color": "bg-pink-500" }
      ],
      "solution": [1, 2, 3, 4],
      "explanation": "Select balls 1, 2, 3 and 4 for weight 24 (= capacity) and maximum reward of 66.",
      "difficulty": "hard",
      "phase": "training"
    },
    // Hard 2: capacity=22, optimal=[1,2,3,4], weight=22, reward=68
    {
      "id": 6,
      "capacity": 22,
      "balls": [
        { "id": 1, "weight": 3, "reward": 16, "color": "bg-red-500" },
        { "id": 2, "weight": 5, "reward": 19, "color": "bg-blue-500" },
        { "id": 3, "weight": 6, "reward": 15, "color": "bg-green-500" },
        { "id": 4, "weight": 8, "reward": 18, "color": "bg-yellow-500" },
        { "id": 5, "weight": 9, "reward": 7, "color": "bg-purple-500" },
        { "id": 6, "weight": 11, "reward": 5, "color": "bg-pink-500" }
      ],
      "solution": [1, 2, 3, 4],
      "explanation": "Select balls 1, 2, 3 and 4 for weight 22 (= capacity) and maximum reward of 68.",
      "difficulty": "hard",
      "phase": "training"
    }
  ];

  return practiceQuestions.filter(q => q.balls.length === NUM_BALLS);
}

/**
 * Get questions for Skill Test (Test 1): 3 easy + 4 medium + 3 hard = 10 total
 * Questions are GROUPED by difficulty (easy first, then medium, then hard)
 */
export function getSkillTestQuestions(): Question[] {
  const questions = loadQuestionsForPhase('training');

  // Shuffle within each difficulty group, but keep groups separate
  const shuffledEasy = shuffle(questions.easy);
  const shuffledMedium = shuffle(questions.medium);
  const shuffledHard = shuffle(questions.hard);

  // Return in order: all easy, then all medium, then all hard
  return [
    ...shuffledEasy.slice(0, 3),
    ...shuffledMedium.slice(0, 4),
    ...shuffledHard.slice(0, 3)
  ];
}

/**
 * Get questions for Benchmark Test (Test 2): 10 easy + 10 medium + 10 hard = 30 total
 * Questions are RANDOMIZED (not grouped)
 */
/**
 * Get questions for Benchmark Test (Test 2): 30 random questions
 * Uniformly sampled from ALL available benchmark questions (approx 300)
 */
export function getBenchmarkPhaseQuestions(): Question[] {
  // Get ALL benchmark questions
  const allQuestions = (staticQuestions.questions as Question[]).filter(
    (q) => q.phase === 'benchmark' && q.balls.length === NUM_BALLS
  );

  // Shuffle the entire pool
  const shuffled = shuffle(allQuestions);

  // Return the first 30
  return shuffled.slice(0, 30);
}

/**
 * Get questions for Final Test (Test 3): 30 random questions
 * Uniformly sampled from ALL available prediction questions (approx 300)
 */
export function getPredictionPhaseQuestions(): Question[] {
  // Get ALL prediction questions
  const allQuestions = (staticQuestions.questions as Question[]).filter(
    (q) => q.phase === 'prediction' && q.balls.length === NUM_BALLS
  );

  // Shuffle the entire pool
  const shuffled = shuffle(allQuestions);

  // Return the first 30
  return shuffled.slice(0, 30);
}

/**
 * Aliases for consistency with old static-loader
 */
export const getTrainingPhase1Questions = getPracticeQuestions;
export const getTrainingPhase2Questions = getSkillTestQuestions;

