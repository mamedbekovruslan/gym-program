import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { useProgramStore } from '../store/programStore';
import { useRestCountdown } from '../hooks/useRestCountdown';
import { Exercise } from '../types/training';
import { normalizeRepsPerSet } from '../utils/training';

type Step = {
  id: string;
  type: 'work' | 'rest';
  exerciseIndex: number;
  setIndex: number;
};

const buildSteps = (exercises: Exercise[]): Step[] => {
  const steps: Step[] = [];
  exercises.forEach((exercise, exerciseIndex) => {
    for (let setIndex = 0; setIndex < exercise.sets; setIndex += 1) {
      steps.push({
        id: `work-${exerciseIndex}-${setIndex}`,
        type: 'work',
        exerciseIndex,
        setIndex
      });
      const isLastSet = setIndex === exercise.sets - 1;
      const hasNextExercise = exerciseIndex < exercises.length - 1;
      const needsRest = exercise.restSec > 0 && (!isLastSet || hasNextExercise);
      if (needsRest) {
        steps.push({
          id: `rest-${exerciseIndex}-${setIndex}`,
          type: 'rest',
          exerciseIndex,
          setIndex
        });
      }
    }
  });
  return steps;
};

const formatStepLabel = (step: Step, exercises: Exercise[]) => {
  const exercise = exercises[step.exerciseIndex];
  if (!exercise) return '';
  if (step.type === 'work') {
    const reps = exercise.repsPerSet?.[step.setIndex];
    return `${exercise.name}: подход ${step.setIndex + 1}${reps ? ` · ${reps} повт.` : ''}`;
  }
  const isLastSet = step.setIndex === exercise.sets - 1;
  const hasNextExercise = step.exerciseIndex < exercises.length - 1;
  if (isLastSet && hasNextExercise) {
    const nextExercise = exercises[step.exerciseIndex + 1];
    return `Отдых перед ${nextExercise.name}`;
  }
  return `Отдых перед подходом ${step.setIndex + 2}`;
};

const findCurrentStepIndex = (
  steps: Step[],
  sessionPhase: 'idle' | 'work' | 'rest' | 'finished',
  sessionExerciseIndex: number,
  sessionSetIndex: number,
  exercises: Exercise[]
) => {
  if (sessionPhase === 'finished') return steps.length;
  if (sessionPhase === 'idle') return -1;
  if (sessionPhase === 'work') {
    return steps.findIndex(
      (step) =>
        step.type === 'work' &&
        step.exerciseIndex === sessionExerciseIndex &&
        step.setIndex === sessionSetIndex
    );
  }
  if (sessionPhase === 'rest') {
    let targetExercise = sessionExerciseIndex;
    let targetSet = sessionSetIndex - 1;
    if (targetSet < 0 && targetExercise > 0) {
      targetExercise -= 1;
      targetSet = exercises[targetExercise]?.sets ? exercises[targetExercise].sets - 1 : 0;
    }
    return steps.findIndex(
      (step) =>
        step.type === 'rest' &&
        step.exerciseIndex === targetExercise &&
        step.setIndex === targetSet
    );
  }
  return -1;
};

const SessionScreen = () => {
  const navigate = useNavigate();
  const program = useProgramStore((state) => state.program);
  const session = useProgramStore((state) => state.session);
  const completeSet = useProgramStore((state) => state.completeSet);
  const skipRest = useProgramStore((state) => state.skipRest);
  const resetSession = useProgramStore((state) => state.resetSession);
  const finishSessionEarly = useProgramStore((state) => state.finishSessionEarly);

  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  useEffect(() => {
    if (program.exercises.length === 0) {
      navigate('/');
    }
  }, [program.exercises.length, navigate]);

  useEffect(() => {
    if (session.phase !== 'rest' || !session.restEndsAt) return;
    if (Date.now() >= session.restEndsAt) {
      skipRest();
      return;
    }
    const id = window.setInterval(() => {
      if (Date.now() >= (session.restEndsAt ?? 0)) {
        skipRest();
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [session.phase, session.restEndsAt, skipRest]);

  const restCountdown = useRestCountdown(session.restEndsAt);
  const exercises = useMemo(
    () => program.exercises.map((exercise) => ({ ...exercise, repsPerSet: normalizeRepsPerSet(exercise) })),
    [program.exercises]
  );
  const steps = useMemo(() => buildSteps(exercises), [exercises]);
  const currentStepIndex = findCurrentStepIndex(
    steps,
    session.phase,
    session.currentExerciseIndex,
    session.currentSetIndex,
    exercises
  );
  const activeStepIndex = currentStepIndex < 0 ? 0 : currentStepIndex;

  const currentExercise = exercises[session.currentExerciseIndex] ?? null;
  const activeStep = steps[activeStepIndex] ?? null;
  const activeStepLabel = activeStep ? formatStepLabel(activeStep, exercises) : '';

  const handleFinish = () => {
    finishSessionEarly();
    resetSession();
    setShowFinishConfirm(false);
    navigate('/');
  };

  if (session.phase === 'finished') {
    return (
      <section className="session-screen">
        <div className="session-card">
          <h2>Тренировка завершена</h2>
          <p>Отличная работа! Можно вернуться к программе или настроить новую.</p>
          <button
            type="button"
            onClick={() => {
              resetSession();
              navigate('/');
            }}
          >
            Вернуться к программе
          </button>
        </div>
      </section>
    );
  }

  if (session.phase === 'idle') {
    return (
      <section className="session-screen">
        <div className="session-card">
          <h2>Сессия не начата</h2>
          <p>Соберите программу и нажмите «Запустить» на главном экране.</p>
          <button type="button" onClick={() => navigate('/')}>
            К программе
          </button>
        </div>
      </section>
    );
  }

  const upcomingExercise =
    session.phase === 'rest' ? exercises[session.currentExerciseIndex] : null;
  const nextSetNumber = session.currentSetIndex + 1;
  const currentReps =
    session.phase === 'work' && currentExercise
      ? currentExercise.repsPerSet?.[session.currentSetIndex]
      : null;

  return (
    <section className="session-screen">
      <header className="session-header">
        <button type="button" className="ghost" onClick={() => navigate('/')}>
          ← К программе
        </button>
        <button type="button" className="finish-button-inline" onClick={() => setShowFinishConfirm(true)}>
          Завершить
        </button>
      </header>

      <div className="session-card stepper-card">
        <div className="card-stepper-column">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={[
                'circle',
                index < activeStepIndex ? 'done' : '',
                index === activeStepIndex ? 'active' : ''
              ].join(' ')}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <div className="card-body">
          {activeStepLabel && <p className="step-label">{activeStepLabel}</p>}
        {session.phase === 'work' && currentExercise && (
          <>
            <p className="session-status">Упражнение</p>
            <h2>{currentExercise.name}</h2>
            <p>
                Подход {session.currentSetIndex + 1} / {currentExercise.sets} ·{' '}
                {currentReps ?? '?'} повт. · {currentExercise.weightKg} кг
              </p>
              <div className="session-actions">
                <button type="button" onClick={completeSet}>
                  Выполнил
                </button>
              </div>
            </>
          )}

          {session.phase === 'rest' && (
            <>
              <p className="session-status">Отдых</p>
              <h2>{restCountdown.formatted}</h2>
              {upcomingExercise && (
                <p>
                  Следующее: {upcomingExercise.name} · подход {nextSetNumber} / {upcomingExercise.sets}
                </p>
              )}
              <div className="session-actions">
                <button type="button" className="skip-button" onClick={skipRest}>
                  Закончить отдых
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showFinishConfirm && (
        <Modal title="Завершить программу?" onClose={() => setShowFinishConfirm(false)}>
          <p>Вы точно хотите завершить текущую программу?</p>
          <div className="confirm-actions">
            <button type="button" onClick={handleFinish}>
              Да
            </button>
            <button type="button" className="ghost" onClick={() => setShowFinishConfirm(false)}>
              Нет
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default SessionScreen;
