import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseForm from '../components/ExerciseForm';
import Modal from '../components/Modal';
import { useProgramStore } from '../store/programStore';
import { normalizeRepsPerSet } from '../utils/training';
const createBlankForm = () => ({
    name: '',
    sets: '3',
    repsPerSet: ['10', '10', '10'],
    weightKg: '0',
    restMinutes: '1',
    restSeconds: '0'
});
const formatRest = (totalSeconds) => {
    if (totalSeconds <= 0)
        return 'без отдыха';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (minutes)
        parts.push(`${minutes} мин`);
    if (seconds)
        parts.push(`${seconds} сек`);
    if (parts.length === 0)
        parts.push('0 сек');
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
    const [form, setForm] = useState(createBlankForm());
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [pendingFinish, setPendingFinish] = useState(false);
    const validate = () => {
        if (!form.name.trim())
            return 'Название обязательно';
        const sets = Number(form.sets);
        const weightKg = Number(form.weightKg);
        const restMinutes = Number(form.restMinutes || '0');
        const restSeconds = Number(form.restSeconds || '0');
        if (Number.isNaN(sets) || sets < 1)
            return 'Минимум 1 подход';
        if (Number.isNaN(weightKg) || weightKg < 0)
            return 'Вес не может быть отрицательным';
        if (Number.isNaN(restMinutes) || restMinutes < 0)
            return 'Минуты отдыха не могут быть отрицательными';
        if (Number.isNaN(restSeconds) || restSeconds < 0 || restSeconds >= 60)
            return 'Секунды отдыха должны быть от 0 до 59';
        if (form.repsPerSet.length !== sets)
            return 'Укажите повторения для каждого подхода';
        for (const value of form.repsPerSet) {
            const reps = Number(value);
            if (Number.isNaN(reps) || reps < 1)
                return 'Повторения в каждом подходе должны быть ≥ 1';
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
        }
        else {
            addExercise({ id: crypto.randomUUID?.() ?? String(Date.now()), ...payload });
        }
        closeModal();
    };
    const handleEdit = (id) => {
        const exercise = program.exercises.find((item) => item.id === id);
        if (!exercise)
            return;
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
    const confirmDelete = (id) => {
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
    return (_jsxs("section", { children: [_jsx("button", { type: "button", onClick: openAddModal, children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435" }), _jsxs("div", { className: "card program-card", children: [_jsx("div", { className: "list-header", children: _jsxs("h2", { children: ["\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 (", program.exercises.length, ")"] }) }), program.exercises.length === 0 && _jsx("p", { children: "\u0421\u043F\u0438\u0441\u043E\u043A \u043F\u0443\u0441\u0442." }), program.exercises.map((exercise, index) => (_jsxs("div", { className: "exercise-row", children: [_jsxs("div", { className: "exercise-row-head", children: [_jsxs("strong", { children: [index + 1, ". ", exercise.name] }), _jsxs("div", { className: "row-actions", children: [_jsx("button", { type: "button", className: "icon-button", onClick: () => handleEdit(exercise.id), "aria-label": "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435", children: "\u270E" }), _jsx("button", { type: "button", className: "icon-button", onClick: () => confirmDelete(exercise.id), "aria-label": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435", children: "\uD83D\uDDD1" })] })] }), _jsxs("p", { children: ["\u041F\u043E\u0434\u0445\u043E\u0434\u044B: ", exercise.sets, " \u00B7 \u041F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u044F: ", normalizeRepsPerSet(exercise).join(' / '), " \u00B7 \u0412\u0435\u0441: ", exercise.weightKg, " \u043A\u0433 \u00B7 \u041E\u0442\u0434\u044B\u0445 ", formatRest(exercise.restSec)] })] }, exercise.id))), program.exercises.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "program-divider" }), _jsx("button", { type: "button", className: "start-button", onClick: handleStartProgram, disabled: session.phase !== 'idle', children: "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443" }), session.phase !== 'idle' && (_jsxs(_Fragment, { children: [_jsx("p", { className: "success-text", children: "\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u0430, \u043C\u043E\u0436\u043D\u043E \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435." }), _jsx("button", { type: "button", className: "open-session", onClick: () => navigate('/session'), children: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044E" }), _jsx("button", { type: "button", className: "finish-button", onClick: handleFinishProgram, children: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443" })] }))] }))] }), isModalOpen && (_jsx(Modal, { title: editingId ? 'Редактировать упражнение' : 'Добавить упражнение', onClose: closeModal, children: _jsx(ExerciseForm, { values: form, onChange: (next) => {
                        const targetSets = Number(next.sets);
                        let repsPerSet = next.repsPerSet;
                        if (Number.isFinite(targetSets) && targetSets > 0) {
                            if (targetSets > repsPerSet.length) {
                                const last = repsPerSet[repsPerSet.length - 1] ?? '10';
                                repsPerSet = [
                                    ...repsPerSet,
                                    ...Array(targetSets - repsPerSet.length).fill(last)
                                ];
                            }
                            else if (targetSets < repsPerSet.length) {
                                repsPerSet = repsPerSet.slice(0, targetSets);
                            }
                        }
                        setForm({ ...next, repsPerSet });
                    }, onSubmit: handleSubmit, onCancelEdit: closeModal, editing: Boolean(editingId), error: error }) })), pendingDelete && (_jsxs(Modal, { title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435?", onClose: closeDeleteModal, children: [_jsx("p", { children: "\u0412\u044B \u0442\u043E\u0447\u043D\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435?" }), _jsxs("div", { className: "confirm-actions", children: [_jsx("button", { type: "button", onClick: handleDelete, children: "\u0414\u0430" }), _jsx("button", { type: "button", className: "ghost", onClick: closeDeleteModal, children: "\u041D\u0435\u0442" })] })] })), pendingFinish && (_jsxs(Modal, { title: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443?", onClose: cancelFinishProgram, children: [_jsx("p", { children: "\u0412\u044B \u0442\u043E\u0447\u043D\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443?" }), _jsxs("div", { className: "confirm-actions", children: [_jsx("button", { type: "button", onClick: confirmFinishProgram, children: "\u0414\u0430" }), _jsx("button", { type: "button", className: "ghost", onClick: cancelFinishProgram, children: "\u041D\u0435\u0442" })] })] }))] }));
};
export default ProgramBuilder;
