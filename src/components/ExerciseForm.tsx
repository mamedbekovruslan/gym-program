import { FormEvent } from 'react';

export interface ExerciseFormValues {
  name: string;
  sets: string;
  repsPerSet: string[];
  weightKg: string;
  restMinutes: string;
  restSeconds: string;
}

interface Props {
  values: ExerciseFormValues;
  onChange: (values: ExerciseFormValues) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
  editing: boolean;
  error?: string | null;
}

const ExerciseForm = ({ values, onChange, onSubmit, onCancelEdit, editing, error }: Props) => {
  const handleInput =
    (field: keyof ExerciseFormValues) =>
    (event: FormEvent<HTMLInputElement>) => {
      onChange({
        ...values,
        [field]: event.currentTarget.value
      });
    };

  return (
    <form
      className="card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label>
        Название
        <input
          value={values.name}
          onInput={handleInput('name')}
          placeholder="Жим лёжа"
          required
        />
      </label>
      <label>
        Подходы
        <input type="number" min={1} value={values.sets} onInput={handleInput('sets')} required />
      </label>
      <div className="set-reps-list">
        {values.repsPerSet.map((reps, index) => (
          <label key={index}>
            Повторения (подход {index + 1})
            <input
              type="number"
              min={1}
              value={reps}
              onInput={(event) => {
                const next = [...values.repsPerSet];
                next[index] = event.currentTarget.value;
                onChange({ ...values, repsPerSet: next });
              }}
              required
            />
          </label>
        ))}
      </div>
      <label>
        Вес (кг)
        <input type="number" min={0} step="0.5" value={values.weightKg} onInput={handleInput('weightKg')} />
      </label>
      <div className="rest-row">
        <label>
          Отдых (мин)
          <input type="number" min={0} value={values.restMinutes} onInput={handleInput('restMinutes')} />
        </label>
        <label>
          Отдых (сек)
          <input type="number" min={0} max={59} value={values.restSeconds} onInput={handleInput('restSeconds')} />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit">{editing ? 'Сохранить' : 'Добавить'}</button>
        {editing && (
          <button type="button" onClick={onCancelEdit}>
            Отмена
          </button>
        )}
      </div>
    </form>
  );
};

export default ExerciseForm;
