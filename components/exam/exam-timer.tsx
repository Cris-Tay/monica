'use client';

import { useMemo } from 'react';

interface ExamTimerProps {
  timeLeft: number; // en segundos
  totalSeconds: number;
}

export function ExamTimer({ timeLeft, totalSeconds }: ExamTimerProps) {
  const { minutes, seconds, percentage, isWarning } = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const pct = (timeLeft / totalSeconds) * 100;
    const warning = timeLeft < 300; // Menos de 5 minutos

    return {
      minutes: mins,
      seconds: secs,
      percentage: pct,
      isWarning: warning,
    };
  }, [timeLeft, totalSeconds]);

  const getColor = () => {
    if (timeLeft <= 60) return 'text-red-600';
    if (isWarning) return 'text-orange-600';
    return 'text-green-600';
  };

  const getBgColor = () => {
    if (timeLeft <= 60) return 'from-red-50 to-red-50';
    if (isWarning) return 'from-orange-50 to-orange-50';
    return 'from-green-50 to-green-50';
  };

  return (
    <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r ${getBgColor()}`}>
      <div className={`text-2xl font-bold ${getColor()}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            timeLeft <= 60
              ? 'bg-red-600'
              : isWarning
              ? 'bg-orange-600'
              : 'bg-green-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={`text-xs font-semibold ${getColor()}`}>
        {timeLeft <= 60 ? '¡Tiempo limitado!' : 'Tiempo restante'}
      </p>
    </div>
  );
}
