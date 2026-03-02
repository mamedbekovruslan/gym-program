import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
const modalRoot = typeof document !== 'undefined' ? document.body : null;
const Modal = ({ title, onClose, children }) => {
    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === 'Escape')
                onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);
    if (!modalRoot)
        return null;
    return createPortal(_jsxs("div", { className: "modal-backdrop", role: "dialog", "aria-modal": "true", children: [_jsxs("div", { className: "modal-content", children: [_jsxs("header", { className: "modal-header", children: [title && _jsx("h2", { children: title }), _jsx("button", { type: "button", className: "ghost close-button", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", children: "\u00D7" })] }), _jsx("div", { children: children })] }), _jsx("div", { className: "modal-overlay", onClick: onClose })] }), modalRoot);
};
export default Modal;
