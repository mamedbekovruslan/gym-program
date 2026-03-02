import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ExerciseForm = ({ values, onChange, onSubmit, onCancelEdit, editing, error }) => {
    const handleInput = (field) => (event) => {
        onChange({
            ...values,
            [field]: event.currentTarget.value
        });
    };
    return (_jsxs("form", { className: "card", onSubmit: (event) => {
            event.preventDefault();
            onSubmit();
        }, children: [_jsxs("label", { children: ["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", _jsx("input", { value: values.name, onInput: handleInput('name'), placeholder: "\u0416\u0438\u043C \u043B\u0451\u0436\u0430", required: true })] }), _jsxs("label", { children: ["\u041F\u043E\u0434\u0445\u043E\u0434\u044B", _jsx("input", { type: "number", min: 1, value: values.sets, onInput: handleInput('sets'), required: true })] }), _jsx("div", { className: "set-reps-list", children: values.repsPerSet.map((reps, index) => (_jsxs("label", { children: ["\u041F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u044F (\u043F\u043E\u0434\u0445\u043E\u0434 ", index + 1, ")", _jsx("input", { type: "number", min: 1, value: reps, onInput: (event) => {
                                const next = [...values.repsPerSet];
                                next[index] = event.currentTarget.value;
                                onChange({ ...values, repsPerSet: next });
                            }, required: true })] }, index))) }), _jsxs("label", { children: ["\u0412\u0435\u0441 (\u043A\u0433)", _jsx("input", { type: "number", min: 0, step: "0.5", value: values.weightKg, onInput: handleInput('weightKg') })] }), _jsxs("div", { className: "rest-row", children: [_jsxs("label", { children: ["\u041E\u0442\u0434\u044B\u0445 (\u043C\u0438\u043D)", _jsx("input", { type: "number", min: 0, value: values.restMinutes, onInput: handleInput('restMinutes') })] }), _jsxs("label", { children: ["\u041E\u0442\u0434\u044B\u0445 (\u0441\u0435\u043A)", _jsx("input", { type: "number", min: 0, max: 59, value: values.restSeconds, onInput: handleInput('restSeconds') })] })] }), error && _jsx("p", { className: "error", children: error }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "submit", children: editing ? 'Сохранить' : 'Добавить' }), editing && (_jsx("button", { type: "button", onClick: onCancelEdit, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }))] })] }));
};
export default ExerciseForm;
