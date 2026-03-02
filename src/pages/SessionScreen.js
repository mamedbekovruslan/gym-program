import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { useProgramStore } from '../store/programStore';
import { useRestCountdown } from '../hooks/useRestCountdown';
import { normalizeRepsPerSet } from '../utils/training';
const buildSteps = (exercises) => {
    const steps = [];
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
const formatStepLabel = (step, exercises) => {
    const exercise = exercises[step.exerciseIndex];
    if (!exercise)
        return '';
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
const findCurrentStepIndex = (steps, sessionPhase, sessionExerciseIndex, sessionSetIndex, exercises) => {
    if (sessionPhase === 'finished')
        return steps.length;
    if (sessionPhase === 'idle')
        return -1;
    if (sessionPhase === 'work') {
        return steps.findIndex((step) => step.type === 'work' &&
            step.exerciseIndex === sessionExerciseIndex &&
            step.setIndex === sessionSetIndex);
    }
    if (sessionPhase === 'rest') {
        let targetExercise = sessionExerciseIndex;
        let targetSet = sessionSetIndex - 1;
        if (targetSet < 0 && targetExercise > 0) {
            targetExercise -= 1;
            targetSet = exercises[targetExercise]?.sets ? exercises[targetExercise].sets - 1 : 0;
        }
        return steps.findIndex((step) => step.type === 'rest' &&
            step.exerciseIndex === targetExercise &&
            step.setIndex === targetSet);
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
        if (session.phase !== 'rest' || !session.restEndsAt)
            return;
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
    const exercises = useMemo(() => program.exercises.map((exercise) => ({ ...exercise, repsPerSet: normalizeRepsPerSet(exercise) })), [program.exercises]);
    const steps = useMemo(() => buildSteps(exercises), [exercises]);
    const currentStepIndex = findCurrentStepIndex(steps, session.phase, session.currentExerciseIndex, session.currentSetIndex, exercises);
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
        return (_jsx("section", { className: "session-screen", children: _jsxs("div", { className: "session-card", children: [_jsx("h2", { children: "\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430" }), _jsx("p", { children: "\u041E\u0442\u043B\u0438\u0447\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430! \u041C\u043E\u0436\u043D\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435 \u0438\u043B\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043D\u043E\u0432\u0443\u044E." }), _jsx("button", { type: "button", onClick: () => {
                            resetSession();
                            navigate('/');
                        }, children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435" })] }) }));
    }
    if (session.phase === 'idle') {
        return (_jsx("section", { className: "session-screen", children: _jsxs("div", { className: "session-card", children: [_jsx("h2", { children: "\u0421\u0435\u0441\u0441\u0438\u044F \u043D\u0435 \u043D\u0430\u0447\u0430\u0442\u0430" }), _jsx("p", { children: "\u0421\u043E\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443 \u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u00AB\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C\u00BB \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u043C \u044D\u043A\u0440\u0430\u043D\u0435." }), _jsx("button", { type: "button", onClick: () => navigate('/'), children: "\u041A \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435" })] }) }));
    }
    const upcomingExercise = session.phase === 'rest' ? exercises[session.currentExerciseIndex] : null;
    const nextSetNumber = session.currentSetIndex + 1;
    const currentReps = session.phase === 'work' && currentExercise
        ? currentExercise.repsPerSet?.[session.currentSetIndex]
        : null;
    return (_jsxs("section", { className: "session-screen", children: [_jsxs("header", { className: "session-header", children: [_jsx("button", { type: "button", className: "ghost", onClick: () => navigate('/'), children: "\u2190 \u041A \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435" }), _jsx("button", { type: "button", className: "finish-button-inline", onClick: () => setShowFinishConfirm(true), children: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C" })] }), _jsxs("div", { className: "session-card stepper-card", children: [_jsx("div", { className: "card-stepper-column", children: steps.map((step, index) => (_jsx("div", { className: [
                                'circle',
                                index < activeStepIndex ? 'done' : '',
                                index === activeStepIndex ? 'active' : ''
                            ].join(' '), children: index + 1 }, step.id))) }), _jsxs("div", { className: "card-body", children: [activeStepLabel && _jsx("p", { className: "step-label", children: activeStepLabel }), session.phase === 'work' && currentExercise && (_jsxs(_Fragment, { children: [_jsx("p", { className: "session-status", children: "\u0423\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435" }), _jsx("h2", { children: currentExercise.name }), _jsxs("p", { children: ["\u041F\u043E\u0434\u0445\u043E\u0434 ", session.currentSetIndex + 1, " / ", currentExercise.sets, " \u00B7", ' ', currentReps ?? '?', " \u043F\u043E\u0432\u0442. \u00B7 ", currentExercise.weightKg, " \u043A\u0433"] }), _jsx("div", { className: "session-actions", children: _jsx("button", { type: "button", onClick: completeSet, children: "\u0412\u044B\u043F\u043E\u043B\u043D\u0438\u043B" }) })] })), session.phase === 'rest' && (_jsxs(_Fragment, { children: [_jsx("p", { className: "session-status", children: "\u041E\u0442\u0434\u044B\u0445" }), _jsx("h2", { children: restCountdown.formatted }), upcomingExercise && (_jsxs("p", { children: ["\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435: ", upcomingExercise.name, " \u00B7 \u043F\u043E\u0434\u0445\u043E\u0434 ", nextSetNumber, " / ", upcomingExercise.sets] })), _jsx("div", { className: "session-actions", children: _jsx("button", { type: "button", className: "skip-button", onClick: skipRest, children: "\u0417\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C \u043E\u0442\u0434\u044B\u0445" }) })] }))] })] }), showFinishConfirm && (_jsxs(Modal, { title: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443?", onClose: () => setShowFinishConfirm(false), children: [_jsx("p", { children: "\u0412\u044B \u0442\u043E\u0447\u043D\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443?" }), _jsxs("div", { className: "confirm-actions", children: [_jsx("button", { type: "button", onClick: handleFinish, children: "\u0414\u0430" }), _jsx("button", { type: "button", className: "ghost", onClick: () => setShowFinishConfirm(false), children: "\u041D\u0435\u0442" })] })] }))] }));
};
export default SessionScreen;
