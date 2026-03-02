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

  return (
    <div className={`app-shell ${isSessionRoute ? 'full-width' : ''}`}>
      <header className="app-header">
        <h1>Gym Program</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ProgramBuilder />} />
          <Route path="/session" element={<SessionScreen />} />
          <Route path="/finished" element={<FinishedScreen />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
