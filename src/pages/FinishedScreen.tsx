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

  return (
    <section className="card">
      <h2>Тренировка завершена 🎉</h2>
      <p>Отличная работа! Вернитесь к программе или настройте новую.</p>
      <button
        type="button"
        onClick={() => {
          resetSession();
          navigate('/');
        }}
      >
        Назад к программе
      </button>
    </section>
  );
};

export default FinishedScreen;
