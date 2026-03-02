import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseForm, { ExerciseFormValues } from '../components/ExerciseForm';
import Modal from '../components/Modal';
import { useProgramStore } from '../store/programStore';
import { Exercise } from '../types/training';
import { normalizeRepsPerSet } from '../utils/training';

const createBlankForm = (): ExerciseFormValues => ({
  name: '',
  sets: '3',
  repsPerSet: ['10', '10', '10'],
  weightKg: '0',
  restMinutes: '1',
  restSeconds: '0'
});

const formatRest = (totalSeconds: number) => {
  if (totalSeconds <= 0) return 'без отдыха';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (minutes) parts.push(`${minutes} мин`);
  if (seconds) parts.push(`${seconds} сек`);
  if (parts.length === 0) parts.push('0 сек');
  return parts.join(' ');
};

const ProgramBuilder = () => {
  const navigate = useNavigate();
  const program = useProgramStore((state) => state.program);
  const session = useProgramStore((state) => state.session);
  const addExercise = useProgramStore((state) => state.addExercise);
  const updateExercise = useProgramStore((state) => state.updateExercise);
  const removeExercise = useProgramStore((state) => state.removeExercise);
  const startSession = useProgramStore((state) => state.startSession);
  const resetSession = useProgramStore((state) => state.resetSession);
  const finishSessionEarly = useProgramStore((state) => state.finishSessionEarly);

  const [form, setForm] = useState<ExerciseFormValues>(createBlankForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingFinish, setPendingFinish] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return 'Название обязательно';
    const sets = Number(form.sets);
    const weightKg = Number(form.weightKg);
    const restMinutes = Number(form.restMinutes || '0');
    const restSeconds = Number(form.restSeconds || '0');

    if (Number.isNaN(sets) || sets < 1) return 'Минимум 1 подход';
    if (Number.isNaN(weightKg) || weightKg < 0) return 'Вес не может быть отрицательным';
    if (Number.isNaN(restMinutes) || restMinutes < 0) return 'Минуты отдыха не могут быть отрицательными';
    if (Number.isNaN(restSeconds) || restSeconds < 0 || restSeconds >= 60)
      return 'Секунды отдыха должны быть от 0 до 59';
    if (form.repsPerSet.length !== sets) return 'Укажите повторения для каждого подхода';
    for (const value of form.repsPerSet) {
      const reps = Number(value);
      if (Number.isNaN(reps) || reps < 1) return 'Повторения в каждом подходе должны быть ≥ 1';
    }
    return null;
  };

  const handleSubmit = () => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    const restMinutes = Number(form.restMinutes || '0');
    const restSeconds = Number(form.restSeconds || '0');
    const restTotal = restMinutes * 60 + restSeconds;
    const repsPerSet = form.repsPerSet.map((value) => Number(value));

    const payload = {
      name: form.name.trim(),
      sets: Number(form.sets),
      repsPerSet,
      weightKg: Number(form.weightKg),
      restSec: restTotal
    };

    if (editingId) {
      updateExercise(editingId, payload);
    } else {
      addExercise({ id: crypto.randomUUID?.() ?? String(Date.now()), ...payload });
    }
    closeModal();
  };

  const handleEdit = (id: string) => {
    const exercise = program.exercises.find((item) => item.id === id);
    if (!exercise) return;
    const minutes = Math.floor(exercise.restSec / 60);
    const seconds = exercise.restSec % 60;
    const repsPerSet = normalizeRepsPerSet(exercise);
    setForm({
      name: exercise.name,
      sets: String(exercise.sets),
      repsPerSet: repsPerSet.map((value) => String(value)),
      weightKg: String(exercise.weightKg),
      restMinutes: String(minutes),
      restSeconds: String(seconds)
    });
    setEditingId(id);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setForm(createBlankForm());
    setEditingId(null);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(createBlankForm());
    setError(null);
  };

  const confirmDelete = (id: string) => {
    setPendingDelete(id);
  };

  const handleDelete = () => {
    if (pendingDelete) {
      removeExercise(pendingDelete);
    }
    setPendingDelete(null);
  };

  const closeDeleteModal = () => setPendingDelete(null);

  const handleStartProgram = () => {
    resetSession();
    startSession();
    navigate('/session');
  };

  const handleFinishProgram = () => {
    setPendingFinish(true);
  };

  const confirmFinishProgram = () => {
    finishSessionEarly();
    resetSession();
    setPendingFinish(false);
  };

  const cancelFinishProgram = () => setPendingFinish(false);

  return (
    <section>
      <button type="button" onClick={openAddModal}>
        Добавить упражнение
      </button>

      <div className="card program-card">
        <div className="list-header">
          <h2>Программа ({program.exercises.length})</h2>
        </div>
        {program.exercises.length === 0 && <p>Список пуст.</p>}
        {program.exercises.map((exercise, index) => (
          <div key={exercise.id} className="exercise-row">
            <div className="exercise-row-head">
              <strong>
                {index + 1}. {exercise.name}
              </strong>
              <div className="row-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => handleEdit(exercise.id)}
                  aria-label="Редактировать упражнение"
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => confirmDelete(exercise.id)}
                  aria-label="Удалить упражнение"
                >
                  🗑
                </button>
              </div>
            </div>
            <p>
              Подходы: {exercise.sets} · Повторения: {normalizeRepsPerSet(exercise).join(' / ')} · Вес: {exercise.weightKg} кг · Отдых {formatRest(exercise.restSec)}
            </p>
          </div>
        ))}
        {program.exercises.length > 0 && (
          <>
            <div className="program-divider" />
            <button
              type="button"
              className="start-button"
              onClick={handleStartProgram}
              disabled={session.phase !== 'idle'}
            >
              Запустить программу
            </button>
            {session.phase !== 'idle' && (
              <>
                <p className="success-text">Программа запущена, можно продолжить выполнение.</p>
                <button type="button" className="open-session" onClick={() => navigate('/session')}>
                  Перейти к выполнению
                </button>
                <button type="button" className="finish-button" onClick={handleFinishProgram}>
                  Завершить программу
                </button>
              </>
            )}
          </>
        )}
      </div>
      {isModalOpen && (
        <Modal
          title={editingId ? 'Редактировать упражнение' : 'Добавить упражнение'}
          onClose={closeModal}
        >
          <ExerciseForm
            values={form}
            onChange={(next) => {
              const targetSets = Number(next.sets);
              let repsPerSet = next.repsPerSet;
              if (Number.isFinite(targetSets) && targetSets > 0) {
                if (targetSets > repsPerSet.length) {
                  const last = repsPerSet[repsPerSet.length - 1] ?? '10';
                  repsPerSet = [
                    ...repsPerSet,
                    ...Array(targetSets - repsPerSet.length).fill(last)
                  ];
                } else if (targetSets < repsPerSet.length) {
                  repsPerSet = repsPerSet.slice(0, targetSets);
                }
              }
              setForm({ ...next, repsPerSet });
            }}
            onSubmit={handleSubmit}
            onCancelEdit={closeModal}
            editing={Boolean(editingId)}
            error={error}
          />
        </Modal>
      )}
      {pendingDelete && (
        <Modal title="Удалить упражнение?" onClose={closeDeleteModal}>
          <p>Вы точно хотите удалить упражнение?</p>
          <div className="confirm-actions">
            <button type="button" onClick={handleDelete}>
              Да
            </button>
            <button type="button" className="ghost" onClick={closeDeleteModal}>
              Нет
            </button>
          </div>
        </Modal>
      )}
      {pendingFinish && (
        <Modal title="Завершить программу?" onClose={cancelFinishProgram}>
          <p>Вы точно хотите завершить текущую программу?</p>
          <div className="confirm-actions">
            <button type="button" onClick={confirmFinishProgram}>
              Да
            </button>
            <button type="button" className="ghost" onClick={cancelFinishProgram}>
              Нет
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default ProgramBuilder;
