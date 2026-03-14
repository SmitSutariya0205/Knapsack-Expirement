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
 * Mathematically enforces that NO dominance relationships exist between any balls.
 * By strictly ordering weights and strictly ordering rewards, we ensure:
 * If W_A < W_B, then R_A < R_B. 
 * A does NOT dominate B (since R_A < R_B).
 * B does NOT dominate A (since W_B > W_A).
 * This forces ZERO dominance relationships.
 */
function enforceHardDominance(q: Question): Question {
  const newQ: Question = JSON.parse(JSON.stringify(q));

  // Sort balls by weight to assign monotonic relationships
  newQ.balls.sort((a, b) => a.weight - b.weight);

  // Ensure weights are strictly increasing
  for (let i = 1; i < newQ.balls.length; i++) {
    if (newQ.balls[i].weight <= newQ.balls[i - 1].weight) {
      newQ.balls[i].weight = newQ.balls[i - 1].weight + 1;
    }
  }

  // Collect rewards and sort them ascending
  let rewards = newQ.balls.map(b => b.reward).sort((a, b) => a - b);

  // Ensure rewards are strictly increasing
  for (let i = 1; i < rewards.length; i++) {
    if (rewards[i] <= rewards[i - 1]) {
      rewards[i] = rewards[i - 1] + 1;
    }
  }

  // Assign strictly increasing rewards to strictly increasing weights
  for (let i = 0; i < newQ.balls.length; i++) {
    newQ.balls[i].reward = rewards[i];
  }

  // Recalculate optimal solution using brute-force (since 6 balls is very small)
  let bestReward = -1;
  let bestSubset: number[] = [];
  const n = newQ.balls.length;

  for (let i = 0; i < (1 << n); i++) {
    let currentWeight = 0;
    let currentReward = 0;
    let currentSubset: number[] = [];

    for (let j = 0; j < n; j++) {
      if ((i & (1 << j)) !== 0) {
        currentWeight += newQ.balls[j].weight;
        currentReward += newQ.balls[j].reward;
        currentSubset.push(newQ.balls[j].id);
      }
    }

    if (currentWeight <= newQ.capacity && currentReward > bestReward) {
      bestReward = currentReward;
      bestSubset = currentSubset;
    }
  }

  newQ.solution = bestSubset;
  if (newQ.explanation) {
    newQ.explanation = `Select balls ${bestSubset.join(', ')} for a maximum reward of ${bestReward}.`;
  }

  return newQ;
}

/**
 * Get practice questions (hardcoded 6 questions: 2 easy + 2 medium + 2 hard)
 */
export function getPracticeQuestions(): Question[] {
  const questions = loadQuestionsForPhase('training');

  // We want EXACTLY 6 total questions: 2 Easy, 2 Medium, 2 Hard
  // We'll shuffle each difficulty bucket separately and take 2 from each
  const practiceEasy = shuffle(questions.easy).slice(0, 2);
  const practiceMedium = shuffle(questions.medium).slice(0, 2);

  // The static-questions.json lacks natively "strict no-dominance" Hard questions.
  // We map them through enforceHardDominance to perfectly satisfy the rule just for Practice.
  const practiceHard = shuffle(questions.hard).slice(0, 2).map(enforceHardDominance);

  return shuffle([
    ...practiceEasy,
    ...practiceMedium,
    ...practiceHard
  ]);
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
  // Easy and Medium natively satisfy their dominance definitions.
  // We strictly enforce zero-dominance for Hard questions.
  return [
    ...shuffledEasy.slice(0, 3),
    ...shuffledMedium.slice(0, 4),
    ...shuffledHard.slice(0, 3).map(enforceHardDominance)
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

