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
    {
      "id": 1,
      "capacity": 34,
      "balls": [
        {
          "id": 1,
          "weight": 2,
          "reward": 22,
          "color": "bg-red-500"
        },
        {
          "id": 2,
          "weight": 4,
          "reward": 19,
          "color": "bg-blue-500"
        },
        {
          "id": 3,
          "weight": 7,
          "reward": 18,
          "color": "bg-green-500"
        },
        {
          "id": 4,
          "weight": 8,
          "reward": 14,
          "color": "bg-yellow-500"
        },
        {
          "id": 5,
          "weight": 12,
          "reward": 9,
          "color": "bg-purple-500"
        },
        {
          "id": 6,
          "weight": 12,
          "reward": 7,
          "color": "bg-pink-500"
        }
      ],
      "solution": [
        1,
        2,
        3,
        4,
        5
      ],
      "explanation": "The optimal selection maximizes reward (82) while staying within capacity (33/34).",
      "difficulty": "easy",
      "phase": "training",
      "metadata": {
        "dominanceCount": 5,
        "slackRatio": 0.7555555555555555,
        "optimalityGap": 2,
        "densityVariance": 12.963230662635423
      }
    },
    {
      "id": 2,
      "capacity": 34,
      "balls": [
        {
          "id": 1,
          "weight": 3,
          "reward": 22,
          "color": "bg-red-500"
        },
        {
          "id": 2,
          "weight": 4,
          "reward": 21,
          "color": "bg-blue-500"
        },
        {
          "id": 3,
          "weight": 6,
          "reward": 17,
          "color": "bg-green-500"
        },
        {
          "id": 4,
          "weight": 8,
          "reward": 14,
          "color": "bg-yellow-500"
        },
        {
          "id": 5,
          "weight": 11,
          "reward": 10,
          "color": "bg-purple-500"
        },
        {
          "id": 6,
          "weight": 14,
          "reward": 7,
          "color": "bg-pink-500"
        }
      ],
      "solution": [
        1,
        2,
        3,
        4,
        5
      ],
      "explanation": "The optimal selection maximizes reward (84) while staying within capacity (32/34).",
      "difficulty": "easy",
      "phase": "training",
      "metadata": {
        "dominanceCount": 5,
        "slackRatio": 0.7391304347826086,
        "optimalityGap": 10,
        "densityVariance": 5.99953448627691
      }
    },
    {
      "id": 3,
      "capacity": 21,
      "balls": [
        {
          "id": 1,
          "weight": 3,
          "reward": 30,
          "color": "bg-red-500"
        },
        {
          "id": 2,
          "weight": 5,
          "reward": 28,
          "color": "bg-blue-500"
        },
        {
          "id": 3,
          "weight": 7,
          "reward": 26,
          "color": "bg-green-500"
        },
        {
          "id": 4,
          "weight": 8,
          "reward": 13,
          "color": "bg-yellow-500"
        },
        {
          "id": 5,
          "weight": 4,
          "reward": 30,
          "color": "bg-purple-500"
        },
        {
          "id": 6,
          "weight": 5,
          "reward": 20,
          "color": "bg-pink-500"
        }
      ],
      "solution": [
        1,
        2,
        3,
        5
      ],
      "explanation": "The optimal selection maximizes reward (114) while staying within capacity (19/21).",
      "difficulty": "medium",
      "phase": "training",
      "metadata": {
        "dominanceCount": 5,
        "slackRatio": 0.65625,
        "optimalityGap": 6,
        "densityVariance": 7.443666737528345
      }
    },
    {
      "id": 4,
      "capacity": 23,
      "balls": [
        {
          "id": 1,
          "weight": 3,
          "reward": 30,
          "color": "bg-red-500"
        },
        {
          "id": 2,
          "weight": 5,
          "reward": 28,
          "color": "bg-blue-500"
        },
        {
          "id": 3,
          "weight": 7,
          "reward": 26,
          "color": "bg-green-500"
        },
        {
          "id": 4,
          "weight": 10,
          "reward": 14,
          "color": "bg-yellow-500"
        },
        {
          "id": 5,
          "weight": 4,
          "reward": 19,
          "color": "bg-purple-500"
        },
        {
          "id": 6,
          "weight": 8,
          "reward": 16,
          "color": "bg-pink-500"
        }
      ],
      "solution": [
        1,
        2,
        3,
        5
      ],
      "explanation": "The optimal selection maximizes reward (103) while staying within capacity (19/23).",
      "difficulty": "medium",
      "phase": "training",
      "metadata": {
        "dominanceCount": 5,
        "slackRatio": 0.6216216216216216,
        "optimalityGap": 3,
        "densityVariance": 7.993986678004535
      }
    },
    {
      "id": 5,
      "capacity": 28,
      "balls": [
        {
          "id": 1,
          "weight": 4,
          "reward": 36,
          "color": "bg-red-500"
        },
        {
          "id": 2,
          "weight": 6,
          "reward": 34,
          "color": "bg-blue-500"
        },
        {
          "id": 3,
          "weight": 8,
          "reward": 32,
          "color": "bg-green-500"
        },
        {
          "id": 4,
          "weight": 5,
          "reward": 19,
          "color": "bg-yellow-500"
        },
        {
          "id": 5,
          "weight": 6,
          "reward": 36,
          "color": "bg-purple-500"
        },
        {
          "id": 6,
          "weight": 9,
          "reward": 31,
          "color": "bg-pink-500"
        }
      ],
      "solution": [
        1,
        2,
        3,
        5
      ],
      "explanation": "The optimal selection maximizes reward (138) while staying within capacity (24/28).",
      "difficulty": "hard",
      "phase": "training",
      "metadata": {
        "dominanceCount": 5,
        "slackRatio": 0.7368421052631579,
        "optimalityGap": 1,
        "densityVariance": 3.6159122085048003
      }
    },
    {
      "id": 6,
      "capacity": 30,
      "balls": [
        {
          "id": 1,
          "weight": 8,
          "reward": 33,
          "color": "bg-red-500"
        },
        {
          "id": 2,
          "weight": 12,
          "reward": 16,
          "color": "bg-blue-500"
        },
        {
          "id": 3,
          "weight": 11,
          "reward": 24,
          "color": "bg-green-500"
        },
        {
          "id": 4,
          "weight": 4,
          "reward": 21,
          "color": "bg-yellow-500"
        },
        {
          "id": 5,
          "weight": 4,
          "reward": 13,
          "color": "bg-purple-500"
        },
        {
          "id": 6,
          "weight": 7,
          "reward": 14,
          "color": "bg-pink-500"
        }
      ],
      "solution": [
        1,
        3,
        4,
        6
      ],
      "explanation": "The optimal selection maximizes reward (92) while staying within capacity (30/30).",
      "difficulty": "hard",
      "phase": "training",
      "metadata": {
        "dominanceCount": 4,
        "slackRatio": 0.6521739130434783,
        "optimalityGap": 1,
        "densityVariance": 1.8057584206968682
      }
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

