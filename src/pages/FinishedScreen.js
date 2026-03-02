import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgramStore } from '../store/programStore';
const FinishedScreen = () => {
    const navigate = useNavigate();
    const session = useProgramStore((state) => state.session);
    const resetSession = useProgramStore((state) => state.resetSession);
    useEffect(() => {
        if (session.phase !== 'finished') {
            navigate('/');
        }
    }, [session.phase, navigate]);
    return (_jsxs("section", { className: "card", children: [_jsx("h2", { children: "\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430 \uD83C\uDF89" }), _jsx("p", { children: "\u041E\u0442\u043B\u0438\u0447\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430! \u0412\u0435\u0440\u043D\u0438\u0442\u0435\u0441\u044C \u043A \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435 \u0438\u043B\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u043D\u043E\u0432\u0443\u044E." }), _jsx("button", { type: "button", onClick: () => {
                    resetSession();
                    navigate('/');
                }, children: "\u041D\u0430\u0437\u0430\u0434 \u043A \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435" })] }));
};
export default FinishedScreen;
