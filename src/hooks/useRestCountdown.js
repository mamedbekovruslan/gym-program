import { useEffect, useState } from 'react';
const getRemainingMs = (target) => target ? Math.max(0, target - Date.now()) : 0;
export const useRestCountdown = (target) => {
    const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(target));
    useEffect(() => {
        if (!target) {
            setRemainingMs(0);
            return;
        }
        const id = window.setInterval(() => {
            setRemainingMs(getRemainingMs(target));
        }, 1000);
        return () => window.clearInterval(id);
    }, [target]);
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
        totalSeconds,
        formatted: `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
    };
};
