import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../utils/storage';
const uuid = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
const makeSession = () => ({
    phase: 'idle',
    startedAt: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    restEndsAt: null
});
const initialProgram = {
    id: uuid(),
    name: 'Моя программа',
    exercises: []
};
export const useProgramStore = create()(persist((set, get) => ({
    program: initialProgram,
    session: makeSession(),
    setProgramName: (name) => set((state) => ({ program: { ...state.program, name } })),
    addExercise: (exercise) => set((state) => ({
        program: { ...state.program, exercises: [...state.program.exercises, exercise] }
    })),
    updateExercise: (id, updates) => set((state) => ({
        program: {
            ...state.program,
            exercises: state.program.exercises.map((exercise) => exercise.id === id ? { ...exercise, ...updates } : exercise)
        }
    })),
    removeExercise: (id) => set((state) => ({
        program: {
            ...state.program,
            exercises: state.program.exercises.filter((exercise) => exercise.id !== id)
        }
    })),
    startSession: () => set((state) => {
        if (state.program.exercises.length === 0)
            return state;
        return {
            session: {
                phase: 'work',
                startedAt: Date.now(),
                currentExerciseIndex: 0,
                currentSetIndex: 0,
                restEndsAt: null
            }
        };
    }),
    completeSet: () => set((state) => {
        const { program, session } = state;
        const exercises = program.exercises;
        const currentExercise = exercises[session.currentExerciseIndex];
        if (!currentExercise) {
            return { session: { ...makeSession(), phase: 'finished' } };
        }
        const nextSetIndex = session.currentSetIndex + 1;
        const moreSets = nextSetIndex < currentExercise.sets;
        const now = Date.now();
        const restDurationMs = currentExercise.restSec * 1000;
        if (moreSets) {
            return {
                session: {
                    ...session,
                    currentSetIndex: nextSetIndex,
                    phase: currentExercise.restSec > 0 ? 'rest' : 'work',
                    restEndsAt: currentExercise.restSec > 0 ? now + restDurationMs : null
                }
            };
        }
        const nextExerciseIndex = session.currentExerciseIndex + 1;
        const hasNextExercise = nextExerciseIndex < exercises.length;
        if (hasNextExercise) {
            return {
                session: {
                    ...session,
                    phase: currentExercise.restSec > 0 ? 'rest' : 'work',
                    restEndsAt: currentExercise.restSec > 0 ? now + restDurationMs : null,
                    currentExerciseIndex: nextExerciseIndex,
                    currentSetIndex: 0
                }
            };
        }
        return {
            session: { ...session, phase: 'finished', restEndsAt: null }
        };
    }),
    skipRest: () => set((state) => state.session.phase !== 'rest'
        ? state
        : { session: { ...state.session, phase: 'work', restEndsAt: null } }),
    finishSessionEarly: () => set((state) => ({
        session: { ...state.session, phase: 'finished', restEndsAt: null }
    })),
    resetSession: () => set({ session: makeSession() }),
    rehydrateSession: () => set((state) => {
        const session = state.session;
        if (session.phase === 'rest' && session.restEndsAt) {
            if (Date.now() >= session.restEndsAt) {
                return { session: { ...session, phase: 'work', restEndsAt: null } };
            }
        }
        return state;
    })
}), {
    name: 'gym-program-store',
    storage: createJSONStorage(() => ({
        getItem: safeStorage.getItem,
        setItem: safeStorage.setItem,
        removeItem: safeStorage.removeItem
    }))
}));
