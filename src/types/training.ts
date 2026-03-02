export type UUID = string;

export interface Exercise {
  id: UUID;
  name: string;
  sets: number;
  repsPerSet: number[];
  weightKg: number;
  restSec: number;
}

export interface Program {
  id: UUID;
  name: string;
  exercises: Exercise[];
}

export type SessionPhase = 'idle' | 'work' | 'rest' | 'finished';

export interface SessionState {
  phase: SessionPhase;
  startedAt: number | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  restEndsAt: number | null;
}
