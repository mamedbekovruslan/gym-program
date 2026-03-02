import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ProgramBuilder from './pages/ProgramBuilder';
import SessionScreen from './pages/SessionScreen';
import FinishedScreen from './pages/FinishedScreen';
import { useProgramStore } from './store/programStore';
const App = () => {
    const rehydrateSession = useProgramStore((state) => state.rehydrateSession);
    const location = useLocation();
    const isSessionRoute = location.pathname === '/session';
    useEffect(() => {
        rehydrateSession();
    }, [rehydrateSession]);
    return (_jsxs("div", { className: `app-shell ${isSessionRoute ? 'full-width' : ''}`, children: [_jsx("header", { className: "app-header", children: _jsx("h1", { children: "Gym Program" }) }), _jsx("main", { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(ProgramBuilder, {}) }), _jsx(Route, { path: "/session", element: _jsx(SessionScreen, {}) }), _jsx(Route, { path: "/finished", element: _jsx(FinishedScreen, {}) })] }) })] }));
};
export default App;
